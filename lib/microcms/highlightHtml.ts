import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { toHtml } from 'hast-util-to-html'
import { toString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
import type { ElementContent, Element, Parent } from 'hast'
import { refractor } from 'refractor/lib/core.js'

import arduino from 'refractor/lang/arduino.js'
import cpp from 'refractor/lang/cpp.js'
import c from 'refractor/lang/c.js'
import armasm from 'refractor/lang/armasm.js'
import asm6502 from 'refractor/lang/asm6502.js'
import asmatmel from 'refractor/lang/asmatmel.js'
import nasm from 'refractor/lang/nasm.js'
import java from 'refractor/lang/java.js'
import kotlin from 'refractor/lang/kotlin.js'
import swift from 'refractor/lang/swift.js'
import rust from 'refractor/lang/rust.js'
import go from 'refractor/lang/go.js'
import ruby from 'refractor/lang/ruby.js'
import php from 'refractor/lang/php.js'
import python from 'refractor/lang/python.js'
import lua from 'refractor/lang/lua.js'
import bash from 'refractor/lang/bash.js'
import shellSession from 'refractor/lang/shell-session.js'
import powershell from 'refractor/lang/powershell.js'
import batch from 'refractor/lang/batch.js'
import makefile from 'refractor/lang/makefile.js'
import cmake from 'refractor/lang/cmake.js'
import linkerScript from 'refractor/lang/linker-script.js'
import gcode from 'refractor/lang/gcode.js'
import verilog from 'refractor/lang/verilog.js'
import vhdl from 'refractor/lang/vhdl.js'
import opencl from 'refractor/lang/opencl.js'
import protobuf from 'refractor/lang/protobuf.js'
import sql from 'refractor/lang/sql.js'
import yaml from 'refractor/lang/yaml.js'
import json from 'refractor/lang/json.js'
import json5 from 'refractor/lang/json5.js'
import toml from 'refractor/lang/toml.js'
import ini from 'refractor/lang/ini.js'
import csv from 'refractor/lang/csv.js'
import docker from 'refractor/lang/docker.js'

const defaultLanguage = 'js'

refractor.register(arduino)
refractor.register(cpp)
refractor.register(c)
refractor.register(armasm)
refractor.register(asm6502)
refractor.register(asmatmel)
refractor.register(nasm)
refractor.register(java)
refractor.register(kotlin)
refractor.register(swift)
refractor.register(rust)
refractor.register(go)
refractor.register(ruby)
refractor.register(php)
refractor.register(python)
refractor.register(lua)
refractor.register(bash)
refractor.register(shellSession)
refractor.register(powershell)
refractor.register(batch)
refractor.register(makefile)
refractor.register(cmake)
refractor.register(linkerScript)
refractor.register(gcode)
refractor.register(verilog)
refractor.register(vhdl)
refractor.register(opencl)
refractor.register(protobuf)
refractor.register(sql)
refractor.register(yaml)
refractor.register(json)
refractor.register(json5)
refractor.register(toml)
refractor.register(ini)
refractor.register(csv)
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

const normalizeHighlightedNodes = (nodes: ElementContent[]): ElementContent[] =>
  nodes.map((node) => {
    if (node.type !== 'element') return node
    return {
      ...node,
      properties: node.properties || {},
    }
  })

export const highlightMicroCMSHtml = (html: string): string => {
  if (!html) return html

  try {
    // Early return if no code blocks and no embeds
    const hasCodeBlocks = html.includes('<code')
    const hasEmbedScripts = html.includes('<script')
    const hasIframes = html.includes('iframe')

    if (!hasCodeBlocks && !hasEmbedScripts && !hasIframes) {
      return html
    }

    const tree = fromHtmlIsomorphic(html, { fragment: true })
    let updated = false

    // Process code blocks for syntax highlighting
    if (hasCodeBlocks) {
      visit(tree, 'element', (node, _index, parent) => {
        if (node.tagName !== 'code') return
        if (!parent || parent.type !== 'element' || parent.tagName !== 'pre') return

        const properties = node.properties || {}
        let language =
          getLanguageFromClassName(properties.className) ||
          getLanguageFromClassName(parent.properties?.className) ||
          defaultLanguage

        // Arduino code should use cpp for better tokenization
        if (language === 'arduino') {
          language = 'cpp'
        }

        if (!language || !refractor.registered(language)) return

        const code = toString(node)
        if (!code) return

        try {
          const highlighted = refractor.highlight(code, language)
          if (!highlighted.children || highlighted.children.length === 0) return
          node.children = normalizeHighlightedNodes(highlighted.children as ElementContent[])
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
    }

    // Remove inline script tags from embeds (they will be loaded by MicroCMSEmbedEnhancer)
    // This prevents duplicate script loading and potential conflicts
    // Collect indices to remove in reverse order to avoid index shifting issues
    const scriptsToRemove: Array<{ parent: Parent; index: number }> = []

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'script') return
      if (!parent || typeof index !== 'number') return
      if (parent.type !== 'element' && parent.type !== 'root') return

      const src = node.properties?.src
      if (
        typeof src === 'string' &&
        (src.includes('platform.twitter.com/widgets.js') ||
          src.includes('instagram.com/embed.js') ||
          src.includes('//www.instagram.com/embed.js') ||
          src.includes('//platform.twitter.com/widgets.js'))
      ) {
        scriptsToRemove.push({ parent, index })
      }
    })

    // Remove scripts in reverse order to maintain correct indices
    scriptsToRemove.reverse().forEach(({ parent, index }) => {
      if ('children' in parent && Array.isArray(parent.children)) {
        parent.children.splice(index, 1)
        updated = true
      }
    })

    return updated ? toHtml(tree) : html
  } catch {
    return html
  }
}
