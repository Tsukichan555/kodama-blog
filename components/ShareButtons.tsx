'use client'

import { useState } from 'react'
import { X, Facebook, Linkedin } from '@/components/social-icons/icons'

interface ShareButtonsProps {
  url: string
  title: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = [
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: X,
      color: 'hover:text-black dark:hover:text-white',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: Facebook,
      color: 'hover:text-[#1877F2]',
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: Linkedin,
      color: 'hover:text-[#0A66C2]',
    },
  ]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">シェア：</span>
      {shareLinks.map(({ label, href, Icon, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label}でシェア`}
          title={`${label}でシェア`}
          className={`text-gray-500 transition-colors dark:text-gray-400 ${color}`}
        >
          <Icon className="h-6 w-6 fill-current" />
        </a>
      ))}
      <button
        onClick={handleCopy}
        aria-label="リンクをコピー"
        title="リンクをコピー"
        className="hover:text-primary-500 dark:hover:text-primary-400 flex items-center gap-1 text-sm text-gray-500 transition-colors dark:text-gray-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {copied ? 'コピーしました！' : 'リンクをコピー'}
      </button>
    </div>
  )
}
