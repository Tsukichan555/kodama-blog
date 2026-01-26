'use client'

import { useEffect } from 'react'

/**
 * Client component to enhance embedded content from external services
 * Handles X (Twitter), Instagram, and YouTube embeds by loading their respective scripts
 *
 * Based on MicroCMS documentation:
 * https://help.microcms.io/ja/knowledge/caution-of-instagram-embed
 */
export default function MicroCMSEmbedEnhancer() {
  useEffect(() => {
    // X (Twitter) Platform Script
    // Loads the Twitter widgets.js script to render Twitter embeds
    const loadTwitterScript = () => {
      // Check for Twitter embeds - both blockquote and iframe formats
      const hasTwitterBlockquote = document.querySelector('.twitter-tweet')
      const hasTwitterIframe = document.querySelector(
        'iframe[src*="twitter.com"], iframe[src*="x.com"]'
      )

      if (!hasTwitterBlockquote && !hasTwitterIframe) {
        console.log('[MicroCMSEmbedEnhancer] No Twitter embeds found')
        return
      }

      console.log('[MicroCMSEmbedEnhancer] Twitter embeds detected:', {
        blockquote: !!hasTwitterBlockquote,
        iframe: !!hasTwitterIframe,
      })

      // Check if script already loaded
      if (window.twttr?.widgets) {
        // If script exists, manually trigger widget rendering
        console.log('[MicroCMSEmbedEnhancer] Twitter script already loaded, triggering render')
        window.twttr.widgets.load()
        return
      }

      // Load Twitter script
      console.log('[MicroCMSEmbedEnhancer] Loading Twitter script')
      const script = document.createElement('script')
      script.id = 'twitter-wjs'
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'

      // Wait for script to load, then trigger rendering
      script.onload = () => {
        console.log('[MicroCMSEmbedEnhancer] Twitter script loaded')
        if (window.twttr?.widgets) {
          window.twttr.widgets.load()
        }
      }

      script.onerror = (error) => {
        console.error('[MicroCMSEmbedEnhancer] Failed to load Twitter script:', error)
      }

      document.body.appendChild(script)
    }

    // Instagram Embed Script
    // Loads the Instagram embed.js script to render Instagram posts
    const loadInstagramScript = () => {
      // Check for Instagram embeds - both blockquote and iframe formats
      const hasInstagramBlockquote = document.querySelector('.instagram-media')
      const hasInstagramIframe = document.querySelector('iframe[src*="instagram.com"]')

      if (!hasInstagramBlockquote && !hasInstagramIframe) {
        console.log('[MicroCMSEmbedEnhancer] No Instagram embeds found')
        return
      }

      console.log('[MicroCMSEmbedEnhancer] Instagram embeds detected:', {
        blockquote: !!hasInstagramBlockquote,
        iframe: !!hasInstagramIframe,
      })

      // Check if script already loaded
      if (window.instgrm?.Embeds) {
        // If script exists, manually trigger embed processing
        console.log('[MicroCMSEmbedEnhancer] Instagram script already loaded, triggering process')
        window.instgrm.Embeds.process()
        return
      }

      // Load Instagram script with https protocol
      console.log('[MicroCMSEmbedEnhancer] Loading Instagram script')
      const script = document.createElement('script')
      script.id = 'instagram-embed'
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true

      // Wait for script to load, then trigger processing
      script.onload = () => {
        console.log('[MicroCMSEmbedEnhancer] Instagram script loaded')
        if (window.instgrm?.Embeds) {
          window.instgrm.Embeds.process()
        }
      }

      script.onerror = (error) => {
        console.error('[MicroCMSEmbedEnhancer] Failed to load Instagram script:', error)
      }

      document.body.appendChild(script)
    }

    // YouTube IFrame API
    // Note: YouTube embeds work out of the box with iframe tags and don't require
    // additional script loading for basic functionality

    // Execute all embed handlers with a slight delay to ensure DOM is fully ready
    // This delay allows MicroCMS content to be rendered before checking for embeds
    const DOM_READY_DELAY = 100
    const timer = setTimeout(() => {
      console.log('[MicroCMSEmbedEnhancer] Starting embed enhancement')
      loadTwitterScript()
      loadInstagramScript()
    }, DOM_READY_DELAY)

    return () => clearTimeout(timer)
  }, [])

  return null
}

// Type declarations for external embed APIs
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void
      }
    }
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}
