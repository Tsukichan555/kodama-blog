import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'

interface PageSEOProps {
  title: string
  description?: string
  image?: string
  path?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export const buildCanonicalUrl = (path = '/'): string => {
  const baseUrl = siteMetadata.siteUrl?.replace(/\/+$/, '') || ''
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

export function genPageMetadata({
  title,
  description,
  image,
  path = '/',
  ...rest
}: PageSEOProps): Metadata {
  const canonicalUrl = buildCanonicalUrl(path)
  const { alternates: restAlternates, ...otherRest } = rest
  return {
    title,
    description: description || siteMetadata.description,
    alternates: {
      ...restAlternates,
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      url: canonicalUrl,
      siteName: siteMetadata.title,
      images: image ? [image] : [siteMetadata.socialBanner],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      title: `${title} | ${siteMetadata.title}`,
      card: 'summary_large_image',
      images: image ? [image] : [siteMetadata.socialBanner],
    },
    ...otherRest,
  }
}
