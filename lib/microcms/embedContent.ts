export interface EmbedProviders {
  instagram: boolean
  twitter: boolean
  iframely: boolean
}

interface EmbedProviderDefinition {
  key: keyof EmbedProviders
  patterns: string[]
}

const EMBED_PROVIDER_DEFINITIONS: EmbedProviderDefinition[] = [
  {
    key: 'instagram',
    patterns: ['instagram-media', 'www.instagram.com'],
  },
  {
    key: 'twitter',
    patterns: ['twitter-tweet', 'platform.twitter.com'],
  },
  {
    key: 'iframely',
    patterns: ['iframely-embed', 'iframe.ly'],
  },
]

const EMPTY_EMBED_PROVIDERS: EmbedProviders = {
  instagram: false,
  twitter: false,
  iframely: false,
}

export const detectEmbedProviders = (html: string): EmbedProviders => {
  if (!html) {
    return EMPTY_EMBED_PROVIDERS
  }

  return EMBED_PROVIDER_DEFINITIONS.reduce<EmbedProviders>(
    (acc, definition) => {
      acc[definition.key] = definition.patterns.some((pattern) => html.includes(pattern))
      return acc
    },
    {
      ...EMPTY_EMBED_PROVIDERS,
    }
  )
}

export const stripExternalScripts = (html: string): string => {
  if (!html) {
    return html
  }

  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
}
