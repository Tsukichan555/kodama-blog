'use client'

import siteMetadata from '@/data/siteMetadata'
import { useState } from 'react'
import { Drawer } from 'vaul'
import { Share } from 'lucide-react'
import { X, Facebook, Threads, Line } from '@/components/social-icons/icons'

interface Props {
  shareUrl?: string
  shareTitle?: string
}

const ScrollTopAndComment = ({ shareUrl, shareTitle }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copied, setCopied] = useState<'idle' | 'success' | 'error'>('idle')

  const handleScrollTop = () => {
    window.scrollTo({ top: 0 })
  }
  const handleScrollToComment = () => {
    document.getElementById('comment')?.scrollIntoView()
  }
  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied('success')
    } catch {
      setCopied('error')
    } finally {
      setTimeout(() => setCopied('idle'), 2000)
    }
  }

  const encodedUrl = shareUrl ? encodeURIComponent(shareUrl) : ''
  const encodedTitle = shareTitle ? encodeURIComponent(shareTitle) : ''

  const shareLinks = [
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: X,
      bg: 'bg-black',
    },
    {
      label: 'LINE',
      href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      Icon: Line,
      bg: 'bg-[#06C755]',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: Facebook,
      bg: 'bg-[#1877F2]',
    },
    {
      label: 'Threads',
      href: `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`,
      Icon: Threads,
      bg: 'bg-black',
    },
  ]

  return (
    <>
      <div className="fixed right-4 bottom-6 z-30 flex flex-col gap-3 md:right-8 md:bottom-8">
        {siteMetadata.comments?.provider && (
          <button
            aria-label="Scroll To Comment"
            onClick={handleScrollToComment}
            className="rounded-full bg-gray-200 p-2.5 text-gray-500 shadow-md transition-all hover:bg-gray-300 md:p-2 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        {shareUrl && (
          <button
            aria-label="記事をシェア"
            onClick={() => setDrawerOpen(true)}
            className="rounded-full bg-gray-200 p-2.5 text-gray-500 shadow-md transition-all hover:bg-gray-300 md:p-2 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
          >
            <Share className="h-5 w-5" />
          </button>
        )}
        <button
          aria-label="Scroll To Top"
          onClick={handleScrollTop}
          className="rounded-full bg-gray-200 p-2.5 text-gray-500 shadow-md transition-all hover:bg-gray-300 md:p-2 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {shareUrl && (
        <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
            <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 rounded-t-2xl bg-white px-6 pt-4 pb-8 shadow-xl dark:bg-gray-900">
              <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
              <Drawer.Title className="mb-6 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                シェアする
              </Drawer.Title>
              <div className="mb-6 flex justify-center gap-6 sm:gap-10">
                {shareLinks.map(({ label, href, Icon, bg }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-full text-white ${bg}`}
                    >
                      <Icon className="h-7 w-7 fill-current" />
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                  </a>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied === 'success'
                  ? 'コピーしました！'
                  : copied === 'error'
                    ? 'コピーに失敗しました'
                    : 'リンクをコピー'}
              </button>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </>
  )
}

export default ScrollTopAndComment
