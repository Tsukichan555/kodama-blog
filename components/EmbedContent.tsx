'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

import { detectEmbedProviders, stripExternalScripts } from '@/lib/microcms/embedContent'

declare global {
  interface Window {
    iframely?: {
      load: () => void
    }
    instgrm?: {
      Embeds?: {
        process: () => void
      }
    }
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => void
      }
    }
  }
}

interface EmbedContentProps {
  html: string
}

const loadInstagramEmbeds = () => {
  window.instgrm?.Embeds?.process?.()
}

const loadTwitterEmbeds = (container?: HTMLElement | null) => {
  window.twttr?.widgets?.load?.(container ?? undefined)
}

const loadIframelyEmbeds = () => {
  window.iframely?.load?.()
}

export default function EmbedContent({ html }: EmbedContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const embedProviders = detectEmbedProviders(html)
  const sanitizedHtml = stripExternalScripts(html)

  useEffect(() => {
    if (embedProviders.instagram) {
      loadInstagramEmbeds()
    }
    if (embedProviders.twitter) {
      loadTwitterEmbeds(containerRef.current)
    }
    if (embedProviders.iframely) {
      loadIframelyEmbeds()
    }
  }, [embedProviders.iframely, embedProviders.instagram, embedProviders.twitter, html])

  return (
    <>
      {embedProviders.instagram ? (
        <Script
          id="instagram-embed-script"
          src="https://www.instagram.com/embed.js"
          strategy="afterInteractive"
          onLoad={loadInstagramEmbeds}
        />
      ) : null}
      {embedProviders.twitter ? (
        <Script
          id="twitter-embed-script"
          src="https://platform.twitter.com/widgets.js"
          strategy="afterInteractive"
          onLoad={() => loadTwitterEmbeds(containerRef.current)}
        />
      ) : null}
      {embedProviders.iframely ? (
        <Script
          id="iframely-embed-script"
          src="https://cdn.iframe.ly/embed.js"
          strategy="afterInteractive"
          onLoad={loadIframelyEmbeds}
        />
      ) : null}
      <div
        ref={containerRef}
        className="prose dark:prose-invert max-w-none pt-10 pb-8"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </>
  )
}
