'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 rounded-md bg-gray-700/50 p-2 opacity-0 transition-colors duration-200 group-hover:opacity-100 hover:bg-gray-700/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70"
      aria-label="Copy code to clipboard"
      title="Copy code"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4 text-gray-300" />
      )}
    </button>
  )
}
