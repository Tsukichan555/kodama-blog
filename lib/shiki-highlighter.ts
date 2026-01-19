import 'server-only'

import { codeToHtml } from 'shiki'

/**
 * Process HTML content from microCMS to add syntax highlighting to code blocks
 * using Shiki with dual themes (github-light/github-dark)
 */
export async function addSyntaxHighlighting(html: string): Promise<string> {
  // Regular expression to find code blocks in microCMS format
  // microCMS outputs code blocks like: <pre><code class="language-javascript">...</code></pre>
  const codeBlockRegex = /<pre><code(?:\s+class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g

  const matches = Array.from(html.matchAll(codeBlockRegex))

  if (matches.length === 0) {
    return html
  }

  let result = html
  const promises = matches.map(async (match) => {
    const [fullMatch, language, code] = match
    const lang = language || 'text'

    // Decode HTML entities in the code
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')

    try {
      const highlighted = await codeToHtml(decodedCode, {
        lang,
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
        defaultColor: false,
      })

      return { fullMatch, highlighted }
    } catch (error) {
      console.warn(`Failed to highlight code block with language "${lang}":`, error)
      // Return original code block if highlighting fails
      return { fullMatch, highlighted: fullMatch }
    }
  })

  const replacements = await Promise.all(promises)

  for (const { fullMatch, highlighted } of replacements) {
    result = result.replace(fullMatch, highlighted)
  }

  return result
}
