import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { toHtml } from 'hast-util-to-html'
import { toString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
import { refractor } from 'refractor/lib/core.js'

import arduino from 'refractor/lang/arduino.js'
import cpp from 'refractor/lang/cpp.js'
import c from 'refractor/lang/c.js'
import java from 'refractor/lang/java.js'
import kotlin from 'refractor/lang/kotlin.js'
import swift from 'refractor/lang/swift.js'
import rust from 'refractor/lang/rust.js'
import go from 'refractor/lang/go.js'
import ruby from 'refractor/lang/ruby.js'
import php from 'refractor/lang/php.js'
import bash from 'refractor/lang/bash.js'
import sql from 'refractor/lang/sql.js'
import yaml from 'refractor/lang/yaml.js'
import json from 'refractor/lang/json.js'
import toml from 'refractor/lang/toml.js'
import docker from 'refractor/lang/docker.js'

const defaultLanguage = 'js'

refractor.register(arduino)
refractor.register(cpp)
refractor.register(c)
refractor.register(java)
refractor.register(kotlin)
refractor.register(swift)
refractor.register(rust)
refractor.register(go)
refractor.register(ruby)
refractor.register(php)
refractor.register(bash)
refractor.register(sql)
refractor.register(yaml)
refractor.register(json)
refractor.register(toml)
refractor.register(docker)

const getLanguageFromClassName = (className: unknown): string | undefined => {
  if (!className) return undefined
  const classList = Array.isArray(className)
    ? className
    : String(className).split(/\s+/).filter(Boolean)
  const languageClass = classList.find((value) => value.startsWith('language-'))
  if (!languageClass) return undefined
  return languageClass.slice('language-'.length).toLowerCase()
}

const ensureLanguageClass = (properties: Record<string, unknown>, language: string) => {
  const existing = properties.className
  const className = Array.isArray(existing)
    ? existing
    : typeof existing === 'string'
      ? existing.split(/\s+/).filter(Boolean)
      : []
  const langClass = `language-${language}`
  if (!className.includes(langClass)) {
    className.push(langClass)
  }
  properties.className = className
}

export const highlightMicroCMSHtml = (html: string): string => {
  if (!html || !html.includes('<code')) return html

  try {
    const tree = fromHtmlIsomorphic(html, { fragment: true })
    let updated = false

    visit(tree, 'element', (node, _index, parent) => {
      if (node.tagName !== 'code') return
      if (!parent || parent.type !== 'element' || parent.tagName !== 'pre') return

      const properties = node.properties || {}
      const language =
        getLanguageFromClassName(properties.className) ||
        getLanguageFromClassName(parent.properties?.className) ||
        defaultLanguage

      if (!language || !refractor.registered(language)) return

      const code = toString(node)
      if (!code) return

      try {
        const highlighted = refractor.highlight(code, language)
        if (!highlighted.children || highlighted.children.length === 0) return
        node.children = highlighted.children
        node.properties = properties
        ensureLanguageClass(properties, language)
        if (parent.properties) {
          ensureLanguageClass(parent.properties, language)
        } else {
          parent.properties = {}
          ensureLanguageClass(parent.properties, language)
        }
        updated = true
      } catch {
        return
      }
    })

    return updated ? toHtml(tree) : html
  } catch {
    return html
  }
}
