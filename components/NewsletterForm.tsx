'use client'

import { useState } from 'react'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (state === 'loading') return
    setState('loading')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setState(res.ok ? 'success' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          ✓ 登録しました！新しい記事の通知をお送りします。
        </p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <p className="mb-2 text-center text-sm text-gray-500 dark:text-gray-400">
        新着記事をメールで受け取る
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          メールアドレス
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 sm:w-64"
          disabled={state === 'loading'}
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {state === 'loading' ? '登録中…' : '登録する'}
        </button>
      </form>
      {state === 'error' && (
        <p className="mt-2 text-center text-xs text-red-500">
          エラーが発生しました。しばらくしてから再試行してください。
        </p>
      )}
    </div>
  )
}
