/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { MongoUser } from '@pronoundb/shared'

import fastifyFactory from 'fastify'
import fastifyAuth from '@fastify/auth'
import fastifyMongo from '@fastify/mongodb'
import fastifyCookie from '@fastify/cookie'
import fastifyMetrics from 'fastify-metrics'
import fastifyTokenize from 'fastify-tokenize'

import lookup from './lookup.js'
import oauth from './oauth/index.js'
import account from './account.js'
import stats from './stats.js'
import shields from './shields.js'

import config from './config.js'

const fastify = fastifyFactory({
  keepAliveTimeout: 60,
  trustProxy: true,
  logger: { level: 'warn' },
})

fastify.register(fastifyMetrics, {
  prefix: 'pronoundb_',
  endpoint: '/metrics',
  blacklist: [ '/metrics' ],
  invalidRouteGroup: '*',
})

fastify.register(async () => {
  const { register, Counter, Histogram } = fastify.metrics.client
  const requestCounter = new Counter({
    name: 'pronoundb_requests_total',
    help: 'requests count',
    labelNames: [ 'method', 'status_code', 'route' ],
  })
  const incomingBandwidthHistogram = new Histogram({
    name: 'pronoundb_incoming_bytes',
    help: 'incoming bandwidth in bytes',
    labelNames: [ 'method', 'status_code', 'route' ],
  })
  const outgoingBandwidthHistogram = new Histogram({
    name: 'pronoundb_outgoing_bytes',
    help: 'outgoing bandwidth in bytes',
    labelNames: [ 'method', 'status_code', 'route' ],
  })

  register.registerMetric(requestCounter)
  register.registerMetric(incomingBandwidthHistogram)
  register.registerMetric(outgoingBandwidthHistogram)
  register.registerMetric(
    new Counter({
      name: 'pronoundb_lookup_requests_total',
      help: 'lookup requests count',
      labelNames: [ 'platform', 'method' ],
    })
  )
  register.registerMetric(
    new Counter({
      name: 'pronoundb_lookup_ids_total',
      help: 'looked up ids count',
      labelNames: [ 'platform', 'method' ],
    })
  )
  register.registerMetric(
    new Histogram({
      name: 'pronoundb_lookup_bulk_ids_count',
      help: 'amount of ids looked up per bulk request',
      labelNames: [ 'platform' ],
    })
  )

  fastify.addHook('onResponse', (request, reply) => {
    const cfg = <any> reply.context.config
    const url = cfg.url || '*'

    if (url === '/metrics') return
    const labels = {
      method: request.method,
      status_code: reply.statusCode,
      route: url,
    }

    requestCounter.inc(labels)
    incomingBandwidthHistogram.observe(labels, request.raw.socket.bytesRead)
    outgoingBandwidthHistogram.observe(labels, request.raw.socket.bytesWritten)
  })
})

fastify.register(fastifyAuth)
fastify.register(fastifyCookie)
fastify.register(fastifyMongo, { url: config.mongo })
fastify.register(fastifyTokenize, {
  secret: config.secret,
  fastifyAuth: true,
  header: false,
  cookie: 'token',
  fetchAccount: async (id: string) => {
    const user = await fastify.mongo.db!.collection<MongoUser>('accounts').findOne({ _id: new fastify.mongo.ObjectId(id) })
    if (user) (user as any).lastTokenReset = 0
    return user
  },
})

fastify.register(lookup, { prefix: '/api/v1' })
fastify.register(oauth, { prefix: '/api/v1/oauth' })
fastify.register(account, { prefix: '/api/v1/accounts' })
fastify.register(stats, { prefix: '/api/v1/stats' })
fastify.register(shields, { prefix: '/shields' })

fastify.setNotFoundHandler((_: FastifyRequest, reply: FastifyReply) => void reply.code(404).send({ error: 404, message: 'Not Found' }))
fastify.listen({ port: config.apiPort, host: config.bind }, (e) => {
  if (e) {
    console.error(e)
    process.exit(1)
  }
})
