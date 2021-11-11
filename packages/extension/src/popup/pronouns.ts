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

import browser from 'webextension-polyfill'
import { useState, useEffect, useCallback } from 'preact/hooks'
import { Pronouns } from '@pronoundb/shared'

let styling = 'lower'
browser.storage.sync.get([ 'styling' ]).then(({ styling: st }) => (styling = st ?? 'lower'))
browser.storage.onChanged.addListener((changes) => {
  if (changes.styling) {
    styling = changes.styling.newValue
  }
})

export function formatPronouns (id: string) {
  const pronouns = Pronouns[id]
  const idx = styling === 'lower' ? 0 : 1
  return Array.isArray(pronouns) ? pronouns[idx] : pronouns
}

export function usePronouns () {
  const forceUpdate = useState(0)[1]
  const updateFormatted = useCallback((changes: Record<string, { newValue?: string }>) => {
    if (changes.styling) {
      forceUpdate((i) => ++i)
    }
  }, [ forceUpdate ])

  useEffect(() => {
    browser.storage.onChanged.addListener(updateFormatted)
    return () => browser.storage.onChanged.removeListener(updateFormatted)
  }, [ updateFormatted ])
}