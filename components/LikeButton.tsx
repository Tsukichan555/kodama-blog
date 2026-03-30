'use client'

import { useState, useEffect } from 'react'

interface LikeButtonProps {
  articleId: string
  initialCount: number
}

export default function LikeButton({ articleId, initialCount }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const cookieName = `liked_${articleId}`
    const hasLiked = document.cookie.split(';').some((c) => c.trim().startsWith(`${cookieName}=`))
    setLiked(hasLiked)
  }, [articleId])

  const handleLike = async () => {
    if (liked || isLoading) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/like/${articleId}`, { method: 'POST' })
      if (res.ok) {
        const data = (await res.json()) as { likeCount: number }
        setCount(data.likeCount)
        setLiked(true)
        setAnimate(true)
        setTimeout(() => setAnimate(false), 300)
      }
    } catch {
      // Like button is non-critical; silently ignore network errors
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked || isLoading}
      aria-label={liked ? 'いいね済み' : 'いいね'}
      className={[
        'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
        liked
          ? 'cursor-default bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400'
          : 'cursor-pointer bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-pink-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-pink-900/30 dark:hover:text-pink-400',
        isLoading ? 'opacity-60' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'inline-block transition-transform duration-150',
          animate ? 'scale-125' : 'scale-100',
        ].join(' ')}
        aria-hidden="true"
      >
        {liked ? '❤️' : '🤍'}
      </span>
      <span>{count}</span>
    </button>
  )
}
