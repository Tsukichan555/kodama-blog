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
      // Check if Twitter embed exists
      if (!document.querySelector('.twitter-tweet')) return

      // Check if script already loaded
      if (document.getElementById('twitter-wjs')) {
        // If script exists, manually trigger widget rendering
        if (window.twttr?.widgets) {
          window.twttr.widgets.load()
        }
        return
      }

      // Load Twitter script
      const script = document.createElement('script')
      script.id = 'twitter-wjs'
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      document.body.appendChild(script)
    }

    // Instagram Embed Script
    // Loads the Instagram embed.js script to render Instagram posts
    const loadInstagramScript = () => {
      // Check if Instagram embed exists
      if (!document.querySelector('.instagram-media')) return

      // Check if script already loaded
      if (document.getElementById('instagram-embed')) {
        // If script exists, manually trigger embed processing
        if (window.instgrm?.Embeds) {
          window.instgrm.Embeds.process()
        }
        return
      }

      // Load Instagram script
      const script = document.createElement('script')
      script.id = 'instagram-embed'
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)
    }

    // YouTube IFrame API
    // Note: YouTube embeds typically work with just iframe tags and don't require
    // additional script loading for basic functionality
    const checkYouTubeEmbeds = () => {
      const youtubeEmbeds = document.querySelectorAll('iframe[src*="youtube.com"]')
      if (youtubeEmbeds.length > 0) {
        // YouTube iframes work out of the box, no additional processing needed
        // This function is here for future enhancements if needed
      }
    }

    // Execute all embed handlers
    loadTwitterScript()
    loadInstagramScript()
    checkYouTubeEmbeds()
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
