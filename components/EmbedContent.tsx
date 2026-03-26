'use client'

import { useEffect } from 'react'
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
        load: () => void
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

const loadTwitterEmbeds = () => {
  window.twttr?.widgets?.load?.()
}

const loadIframelyEmbeds = () => {
  window.iframely?.load?.()
}

export default function EmbedContent({ html }: EmbedContentProps) {
  const embedProviders = detectEmbedProviders(html)
  const sanitizedHtml = stripExternalScripts(html)

  useEffect(() => {
    if (embedProviders.instagram) {
      loadInstagramEmbeds()
    }
    if (embedProviders.twitter) {
      loadTwitterEmbeds()
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
          onLoad={loadTwitterEmbeds}
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
        className="prose dark:prose-invert max-w-none pt-10 pb-8"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </>
  )
}
