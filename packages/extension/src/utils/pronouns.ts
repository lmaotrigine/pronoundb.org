/*
 * Copyright (c) 2020-2021 Cynthia K. Rey, All rights reserved.
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

import { Pronouns, PronounsShort } from '@pronoundb/shared'

let styling = 'lower'
window.addEventListener('message', (e) => {
  if (e.data.source === 'pronoundb' && e.data.payload.action === 'settings.styling') {
    styling = e.data.payload.styling
  }
})

export function formatPronouns (id: string) {
  const pronouns = Pronouns[id]
  const idx = styling === 'lower' ? 0 : 1
  return Array.isArray(pronouns) ? pronouns[idx] : pronouns
}

export function formatPronounsShort (id: string) {
  const pronouns = PronounsShort[id]
  const idx = styling === 'lower' ? 0 : 1
  return Array.isArray(pronouns) ? pronouns[idx] : pronouns
}

export function formatPronounsLong (id: string) {
  switch (id) {
    case 'any':
      return 'Goes by any pronouns'
    case 'other':
      return 'Goes by pronouns not available on PronounDB'
    case 'ask':
      return 'Prefers people to ask for their pronouns'
    case 'avoid':
      return 'Wants to avoid pronouns'
    default:
      return `Goes by "${formatPronouns(id)}" pronouns`
  }
}