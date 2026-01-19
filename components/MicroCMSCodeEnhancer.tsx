'use client'

import { useEffect } from 'react'

/**
 * Client component to add copy button functionality to MicroCMS code blocks
 * MicroCMS renders code blocks as <pre><code class="language-xxx">...</code></pre>
 * This component adds interactive copy buttons to these blocks
 */
export default function MicroCMSCodeEnhancer() {
  useEffect(() => {
    // Find all pre elements with code children (MicroCMS code blocks)
    const codeBlocks = document.querySelectorAll('pre > code')

    codeBlocks.forEach((codeElement) => {
      const preElement = codeElement.parentElement
      if (!preElement) return

      // Skip if already enhanced
      if (preElement.classList.contains('code-block-enhanced')) return

      // Mark as enhanced
      preElement.classList.add('code-block-enhanced', 'relative')

      // Create wrapper for hover detection
      const wrapper = document.createElement('div')
      wrapper.className = 'relative code-block-wrapper'
      preElement.parentNode?.insertBefore(wrapper, preElement)
      wrapper.appendChild(preElement)

      // Create copy button
      const button = document.createElement('button')
      button.className =
        'code-copy-button absolute right-2 top-2 h-8 w-8 rounded border-2 bg-gray-100 p-1 opacity-0 transition-opacity hover:opacity-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
      button.setAttribute('aria-label', 'Copy code')
      button.type = 'button'

      // Copy icon SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('viewBox', '0 0 24 24')
      svg.setAttribute('stroke', 'currentColor')
      svg.setAttribute('fill', 'none')
      svg.classList.add('text-gray-600', 'dark:text-gray-300')

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('stroke-linecap', 'round')
      path.setAttribute('stroke-linejoin', 'round')
      path.setAttribute('stroke-width', '2')
      path.setAttribute(
        'd',
        'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
      )

      svg.appendChild(path)
      button.appendChild(svg)
      wrapper.appendChild(button)

      // Show button on hover
      wrapper.addEventListener('mouseenter', () => {
        button.classList.remove('opacity-0')
        button.classList.add('opacity-100')
      })

      wrapper.addEventListener('mouseleave', () => {
        button.classList.remove('opacity-100')
        button.classList.add('opacity-0')
      })

      // Copy functionality
      button.addEventListener('click', async () => {
        const text = codeElement.textContent || ''
        await navigator.clipboard.writeText(text)

        // Show checkmark
        path.setAttribute(
          'd',
          'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
        )
        svg.classList.remove('text-gray-600', 'dark:text-gray-300')
        svg.classList.add('text-green-400')
        button.classList.remove('border-gray-300', 'dark:border-gray-600')
        button.classList.add('border-green-400')

        // Reset after 2 seconds
        setTimeout(() => {
          path.setAttribute(
            'd',
            'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
          )
          svg.classList.remove('text-green-400')
          svg.classList.add('text-gray-600', 'dark:text-gray-300')
          button.classList.remove('border-green-400')
          button.classList.add('border-gray-300', 'dark:border-gray-600')
        }, 2000)
      })
    })
  }, [])

  return null
}
