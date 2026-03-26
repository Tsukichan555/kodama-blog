'use client'

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    iframely?: {
      load: () => void
    }
  }
}

interface IframelyContentProps {
  html: string
}

/**
 * Client component to render Iframely embedded content
 * Handles iframely.load() after content is rendered
 */
export default function IframelyContent({ html }: IframelyContentProps) {
  useEffect(() => {
    // Trigger iframely to process the embedded content
    if (window.iframely) {
      window.iframely.load()
    }
  }, [html])

  return (
    <>
      <Script
        src="https://cdn.iframe.ly/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Also trigger load when script first loads
          if (window.iframely) {
            window.iframely.load()
          }
        }}
      />
      <div
        className="prose dark:prose-invert max-w-none pt-10 pb-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  )
}
