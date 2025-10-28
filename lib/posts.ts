import 'server-only'

import { cache } from 'react'
import { allCoreContent, coreContent, sortPosts, type CoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors, type Blog, type Authors } from 'contentlayer/generated'

import { fetchFromMicroCMS, isMicroCMSEnabled } from './microcms/client'

interface MicroCMSListResponse<T> {
  contents: T[]
  totalCount: number
  offset: number
  limit: number
}

interface MicroCMSMedia {
  url: string
  width: number
  height: number
}

interface MicroCMSBlogEntry {
  id: string
  title: string
  tags: string
  maincontent: string
  pic?: MicroCMSMedia
  publishedAt?: string
  revisedAt?: string
  createdAt: string
  updatedAt: string
}

interface MicroCMSAboutEntry {
  aboutme?: string
}

export interface BlogListItem {
  slug: string
  title: string
  summary: string
  tags: string[]
  date: string
  heroImage?: MicroCMSMedia | string | null
}

export interface MicroCMSBlogDetail extends BlogListItem {
  updatedAt?: string
  contentHtml: string
  heroImage?: MicroCMSMedia | null
}

type PostDetailResult =
  | { source: 'microcms'; post: MicroCMSBlogDetail }
  | { source: 'contentlayer'; post: Blog; authors: CoreContent<Authors>[] }

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const buildSummary = (value: string) => {
  const text = stripHtml(value)
  if (text.length <= 160) {
    return text
  }
  return `${text.slice(0, 157)}...`
}

const parseTags = (value: string) =>
  value
    .split('/')
    .map((tag) => tag.trim())
    .filter(Boolean)

const mapMicroCMSToListItem = (entry: MicroCMSBlogEntry): BlogListItem => ({
  slug: entry.id,
  title: entry.title,
  summary: buildSummary(entry.maincontent || ''),
  tags: parseTags(entry.tags || ''),
  date: entry.publishedAt || entry.createdAt,
  heroImage: entry.pic || null,
})

const mapContentlayerToListItem = (entry: CoreContent<Blog>): BlogListItem => ({
  slug: entry.slug,
  title: entry.title,
  summary: entry.summary || '',
  tags: entry.tags || [],
  date: entry.date,
  heroImage: Array.isArray(entry.images) ? entry.images[0] : entry.images || null,
})

export const getAllPosts = cache(async (): Promise<BlogListItem[]> => {
  if (isMicroCMSEnabled()) {
    try {
      const response = await fetchFromMicroCMS<MicroCMSListResponse<MicroCMSBlogEntry>>(
        'blog?limit=100&orders=-publishedAt'
      )
      return response.contents.map(mapMicroCMSToListItem)
    } catch (error) {
      console.warn('Falling back to contentlayer posts after microCMS fetch failure:', error)
    }
  }

  const posts = allCoreContent(sortPosts(allBlogs))
  return posts.map(mapContentlayerToListItem)
})

export const getTagCounts = (posts: BlogListItem[]): Record<string, number> => {
  return posts.reduce<Record<string, number>>((acc, post) => {
    post.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {})
}

export const getPostBySlug = cache(async (slug: string): Promise<PostDetailResult | null> => {
  if (isMicroCMSEnabled()) {
    try {
      const entry = await fetchFromMicroCMS<MicroCMSBlogEntry>(`blog/${slug}`)
      return {
        source: 'microcms',
        post: {
          ...mapMicroCMSToListItem(entry),
          contentHtml: entry.maincontent,
          updatedAt: entry.updatedAt,
          heroImage: entry.pic || null,
        },
      }
    } catch (error) {
      console.warn(
        `Falling back to contentlayer post for slug "${slug}" after microCMS fetch failure:`,
        error
      )
    }
  }

  const post = allBlogs.find((item) => item.slug === slug)
  if (!post) {
    return null
  }
  const authorList = post.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((item) => item.slug === author)
    return coreContent(authorResults as Authors)
  })

  return {
    source: 'contentlayer',
    post,
    authors: authorDetails,
  }
})

export const getAboutContent = cache(async () => {
  if (isMicroCMSEnabled()) {
    try {
      const entry = await fetchFromMicroCMS<MicroCMSAboutEntry>('about')
      return { source: 'microcms' as const, contentHtml: entry.aboutme || '' }
    } catch (error) {
      console.warn('Falling back to contentlayer about page after microCMS fetch failure:', error)
    }
  }

  const author = allAuthors.find((item) => item.slug === 'default') as Authors
  return { source: 'contentlayer' as const, author, content: coreContent(author) }
})
