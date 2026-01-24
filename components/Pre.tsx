'use client'

import { useRef, useState } from 'react'

interface PreProps {
  children: React.ReactNode
  className?: string
}

/**
 * Custom Pre component with copy button functionality
 * Supports both light and dark themes
 */
export default function Pre({ children, className }: PreProps) {
  const textInput = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const onEnter = () => {
    setHovered(true)
  }

  const onExit = () => {
    setHovered(false)
    setCopied(false)
  }

  const onCopy = () => {
    if (!textInput.current) return

    // Check if clipboard API is available
    if (!navigator.clipboard) {
      console.warn('Clipboard API not available')
      return
    }

    setCopied(true)
    const text = textInput.current.textContent || ''
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Failed to copy text:', err)
      setCopied(false)
    })
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div
      ref={textInput}
      onMouseEnter={onEnter}
      onMouseLeave={onExit}
      className={`relative ${className || ''}`}
    >
      {hovered && (
        <button
          aria-label="Copy code"
          type="button"
          className={`absolute [top:0.5rem] [right:0.5rem] [height:var(--size-icon-lg)] [width:var(--size-icon-lg)] rounded [border-width:2px] bg-gray-100 [padding:0.25rem] dark:bg-gray-800 ${
            copied
              ? 'border-green-400 focus:border-green-400 focus:outline-none'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onClick={onCopy}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            className={copied ? 'text-green-400' : 'text-gray-600 dark:text-gray-300'}
          >
            {copied ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            )}
          </svg>
        </button>
      )}
      <pre className={className}>{children}</pre>
    </div>
  )
}
