import 'css/prism.css'
import 'katex/dist/katex.css'

import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import type { Authors, Blog } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import MicroCMSPostLayout from '@/layouts/MicroCMSPostLayout'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { buildCanonicalUrl } from 'app/seo'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  const postResult = await getPostBySlug(slug)
  if (!postResult) {
    return
  }
  const canonicalUrl = buildCanonicalUrl(`/blog/${slug}`)

  if (postResult.source === 'microcms') {
    const { post } = postResult
    const description = post.summary || siteMetadata.description
    const publishedAt = new Date(post.publishedAt).toISOString()
    const modifiedAt = new Date(post.updatedAt || post.publishedAt).toISOString()
    const imageList = post.heroImage?.url ? [post.heroImage.url] : [siteMetadata.socialBanner]
    const ogImages = imageList.map((img) => ({ url: img }))

    return {
      title: post.title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: post.title,
        description,
        siteName: siteMetadata.title,
        locale: siteMetadata.locale?.replace('-', '_') || 'en_US',
        type: 'article',
        publishedTime: publishedAt,
        modifiedTime: modifiedAt,
        url: canonicalUrl,
        images: ogImages,
        authors: [siteMetadata.author],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: imageList,
      },
    }
  }

  const { post, authors } = postResult
  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authorsList = authors.map((author) => author.name)
  let imageList = [siteMetadata.socialBanner]
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images
  }
  const ogImages = imageList.map((img) => {
    return {
      url: img && img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: canonicalUrl,
      images: ogImages,
      authors: authorsList.length > 0 ? authorsList : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () => {
  const posts = await getAllPosts()
  if (posts.length === 0) {
    return allBlogs.map((p) => ({ slug: p.slug.split('/').map((name) => decodeURI(name)) }))
  }
  return posts.map((post) => ({ slug: post.slug.split('/').map((name) => decodeURI(name)) }))
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  const postResult = await getPostBySlug(slug)
  if (!postResult) {
    return notFound()
  }

  if (postResult.source === 'microcms') {
    const posts = await getAllPosts()
    const index = posts.findIndex((item) => item.slug === slug)
    const prev = index + 1 < posts.length ? posts[index + 1] : undefined
    const next = index - 1 >= 0 ? posts[index - 1] : undefined

    return <MicroCMSPostLayout post={postResult.post} prev={prev} next={next} />
  }

  const post = postResult.post as Blog
  // Filter out drafts in production
  const sortedCoreContents = allCoreContent(sortPosts(allBlogs))
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug)
  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const authorDetails = postResult.authors
  const mainContent = coreContent(post)
  const jsonLd = { ...post.structuredData }
  jsonLd['author'] = authorDetails.map((author) => {
    return {
      '@type': 'Person',
      name: author.name,
    }
  })
  const jsonLdContent = JSON.stringify(jsonLd)
  const hasJsonLdContent = Boolean(jsonLdContent && jsonLdContent.trim())

  const Layout = layouts[post.layout || defaultLayout]

  return (
    <>
      {hasJsonLdContent ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdContent }} />
      ) : (
        <script type="application/ld+json" />
      )}
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
    </>
  )
}
