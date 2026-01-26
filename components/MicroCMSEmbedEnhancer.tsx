'use client'

import { useEffect } from 'react'

/**
 * Client component to enhance embedded content from external services
 * Handles X (Twitter), Instagram, and YouTube embeds by triggering their rendering
 *
 * Note: Scripts are included inline from MicroCMS. This component just ensures
 * they execute and process the blockquote elements correctly.
 *
 * Based on MicroCMS documentation:
 * https://help.microcms.io/ja/knowledge/caution-of-instagram-embed
 */
export default function MicroCMSEmbedEnhancer() {
  useEffect(() => {
    // Process Twitter/X embeds
    const processTwitterEmbeds = () => {
      const hasTwitter = document.querySelector('.twitter-tweet')
      if (!hasTwitter) {
        console.log('[MicroCMSEmbedEnhancer] No Twitter embeds found')
        return
      }

      console.log('[MicroCMSEmbedEnhancer] Twitter embeds found, checking for widget API')

      // Wait for twttr object to be available
      const checkTwitter = setInterval(() => {
        if (window.twttr?.widgets) {
          console.log('[MicroCMSEmbedEnhancer] Twitter widgets API available, loading...')
          clearInterval(checkTwitter)
          window.twttr.widgets.load()
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkTwitter)
        if (!window.twttr?.widgets) {
          console.error('[MicroCMSEmbedEnhancer] Twitter widgets API not available after 10s')
        }
      }, 10000)
    }

    // Process Instagram embeds
    const processInstagramEmbeds = () => {
      const hasInstagram = document.querySelector('.instagram-media')
      if (!hasInstagram) {
        console.log('[MicroCMSEmbedEnhancer] No Instagram embeds found')
        return
      }

      console.log('[MicroCMSEmbedEnhancer] Instagram embeds found, checking for embed API')

      // Wait for instgrm object to be available
      const checkInstagram = setInterval(() => {
        if (window.instgrm?.Embeds) {
          console.log('[MicroCMSEmbedEnhancer] Instagram Embeds API available, processing...')
          clearInterval(checkInstagram)
          window.instgrm.Embeds.process()
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInstagram)
        if (!window.instgrm?.Embeds) {
          console.error('[MicroCMSEmbedEnhancer] Instagram Embeds API not available after 10s')
        }
      }, 10000)
    }

    // YouTube IFrame API
    // Note: YouTube embeds work out of the box with iframe tags and don't require
    // additional script loading for basic functionality

    // Wait for DOM to be ready and scripts to load
    const timer = setTimeout(() => {
      console.log('[MicroCMSEmbedEnhancer] Starting embed processing')
      processTwitterEmbeds()
      processInstagramEmbeds()
    }, 500) // Increased delay to allow scripts to load

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Fallback for browsers without JavaScript */}
      <noscript>
        <div style={{ color: '#888', fontSize: '14px', padding: '10px' }}>
          JavaScript を有効にして埋め込みコンテンツを表示してください。
        </div>
      </noscript>
    </>
  )
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
