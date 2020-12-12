/*
 * Copyright (c) 2020 Cynthia K. Rey, All rights reserved.
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

import { h } from 'preact'
import { route } from 'preact-router'
import type { ComponentChildren } from 'preact'

import { Routes } from '@constants'
import style from '@styles/layout.scss'
import { useContext } from 'preact/hooks'
import { Ctx } from './AppContext'

interface LayoutProps {
  children: ComponentChildren
}

const ERRORS = [
  'Something went wrong',
  'Could not authenticate you with the external service due to an error',
  'No account was found, did you mean to create an account?',
  'This account already exists, did you mean to login?'
]

function Layout (props: LayoutProps) {
  const { user, logout, error } = useContext(Ctx)

  return (
    <div className={style.container}>
      <header className={style.header}>
        <div className={style.title}>
          <a href={Routes.HOME}>PronounDB</a>
        </div>
        <div className={style.links}>
          {!user && <a href={Routes.LOGIN}>Login</a>}
          {!user && <a href={Routes.REGISTER}>Create account</a>}
          {user && <a href={Routes.ME}>My account</a>}
          {user && <button className={style.link} onClick={logout}>Logout</button>}
        </div>
      </header>
      <main className={style.content}>
        {typeof error === 'number' && <div className={style.error}>{ERRORS[error]}</div>}
        {props.children}
      </main>
      <footer className={style.footer}>
        <div>
          Copyright &copy; {new Date().getFullYear()} Cynthia K. Rey
        </div>
        <div>
          <a href={Routes.DOCS}>API Docs</a>
          <a href={Routes.LEGAL}>Legal</a>
          <a href={Routes.PRIVACY}>Privacy</a>
          <a href={Routes.GITHUB} target='_blank' rel='noreferrer'>GitHub</a>
        </div>
      </footer>
    </div>
  )
}

Layout.displayName = 'Layout'
export default Layout
