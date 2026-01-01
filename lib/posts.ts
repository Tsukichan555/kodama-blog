import 'server-only'

import { cache } from 'react'
import { allCoreContent, coreContent, sortPosts, type CoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors, type Blog, type Authors } from 'contentlayer/generated'

import { fetchFromMicroCMS, isMicroCMSEnabled } from './microcms/client'
import { projectEntrypointsSubscribe } from 'next/dist/build/swc/generated-native'

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
  overwrotePublishedAt?: string
  createdAt: string
  updatedAt: string
}

interface MicroCMSAboutEntry {
  id?: string
  aboutme?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  revisedAt?: string
}

export interface BlogListItem {
  slug: string
  title: string
  summary: string
  tags: string[]
  date: string
  createdAt: string
  revisedAt?: string
  heroImage?: MicroCMSMedia | string | null
}

export interface MicroCMSBlogDetail extends BlogListItem {
  contentHtml: string
  heroImage?: MicroCMSMedia | null
}

type PostDetailResult =
  | { source: 'microcms'; post: MicroCMSBlogDetail }
  | { source: 'contentlayer'; post: Blog; authors: CoreContent<Authors>[] }

export type AboutContentResult =
  | { source: 'microcms'; contentHtml: string }
  | { source: 'contentlayer'; author: Authors; content: CoreContent<Authors> }

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

const logMicroCMSFallback = (message: string, error: unknown) => {
  if (error instanceof Error) {
    const { name, message: errorMessage, stack } = error
    console.warn(message, {
      name,
      message: errorMessage,
      stack,
    })
    return
  }

  console.warn(message, error)
}

const parseTags = (value: string) =>
  value
    .split('/')
    .map((tag) => tag.trim())
    .filter(Boolean)

const mapMicroCMSToListItem = (entry: MicroCMSBlogEntry): BlogListItem => {
  const createdAt = entry.overwrotePublishedAt ?? entry.createdAt
  const revisedAt = entry.overwrotePublishedAt ? undefined : entry.revisedAt || entry.updatedAt

  return {
    slug: entry.id,
    title: entry.title,
    summary: buildSummary(entry.maincontent || ''),
    tags: parseTags(entry.tags || ''),
    date: createdAt,
    createdAt,
    revisedAt,
    heroImage: entry.pic || null,
  }
}

const mapContentlayerToListItem = (entry: CoreContent<Blog>): BlogListItem => {
  const createdAt = entry.date
  const revisedAt = entry.lastmod
  return {
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary || '',
    tags: entry.tags || [],
    date: createdAt,
    createdAt,
    revisedAt,
    heroImage: Array.isArray(entry.images) ? entry.images[0] : entry.images || null,
  }
}

export const getAllPosts = cache(async (): Promise<BlogListItem[]> => {
  if (isMicroCMSEnabled()) {
    try {
      const response = await fetchFromMicroCMS<MicroCMSListResponse<MicroCMSBlogEntry>>(
        'blog?limit=100&orders=-publishedAt'
      )
      return response.contents.map(mapMicroCMSToListItem)
    } catch (error) {
      logMicroCMSFallback('Falling back to contentlayer posts after microCMS fetch failure:', error)
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
          heroImage: entry.pic || null,
        },
      }
    } catch (error) {
      logMicroCMSFallback(
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

export const getAboutContent = cache(async (): Promise<AboutContentResult> => {
  if (isMicroCMSEnabled()) {
    try {
      const response =
        await fetchFromMicroCMS<MicroCMSListResponse<MicroCMSAboutEntry>>('about?limit=1')
      const entry = response.contents[0]
      if (entry?.aboutme) {
        return { source: 'microcms' as const, contentHtml: entry.aboutme }
      }
      console.warn('microCMS about content is empty; falling back to contentlayer author content.')
    } catch (error) {
      logMicroCMSFallback(
        'Falling back to contentlayer about page after microCMS fetch failure:',
        error
      )
    }
  }

  const author = allAuthors.find((item) => item.slug === 'default') as Authors
  return { source: 'contentlayer' as const, author, content: coreContent(author) }
})

//下書きプレビュー用
export interface MicroCMSDraftParams {
  id: string
  draftKey: string
}

// /api/draftのJSON返却型
export interface DraftPreviewResponse {
  source: 'microcms'
  post: MicroCMSBlogDetail
}

export const getDraftPost = async (params: MicroCMSDraftParams): Promise<DraftPreviewResponse> => {
  //Promise<T> TにはPromiseが履行された(fulfilled)ときに返す値の型を指定します
  const { id, draftKey } = params
  if (!isMicroCMSEnabled()) throw new Error('microCMS disabled')

  try {
    const entry = await fetchFromMicroCMS<MicroCMSBlogEntry>(`blog/${id}?draftKey=${draftKey}`)
    const post: MicroCMSBlogDetail = {
      ...mapMicroCMSToListItem(entry),
      contentHtml: entry.maincontent,
      heroImage: entry.pic || null,
    }
    return {
      source: 'microcms',
      post,
    }
  } catch (error) {
    logMicroCMSFallback('Failed to fetch microCMS draft:', error)
    throw error
  }
}
