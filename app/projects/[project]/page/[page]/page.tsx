import siteMetadata from '@/data/siteMetadata'
import { slug } from 'github-slugger'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { notFound } from 'next/navigation'
import { buildCanonicalUrl, genPageMetadata } from 'app/seo'
import { getAllPosts, getTagCounts } from '@/lib/posts'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: {
  params: Promise<{ project: string; page: string }>
}) {
  const params = await props.params
  const tag = decodeURI(params.project)
  const tagSlug = slug(tag)
  const pageNumber = parseInt(params.page)
  const isFirstPage = pageNumber === 1
  const path = isFirstPage ? `/projects/${tagSlug}` : `/projects/${tagSlug}/page/${pageNumber}`

  return genPageMetadata({
    title: isFirstPage ? tag : `${tag} - Page ${pageNumber}`,
    description: `${siteMetadata.title} ${tag} tagged content`,
    path,
    alternates: {
      types: {
        'application/rss+xml': buildCanonicalUrl(`/projects/${tagSlug}/feed.xml`),
      },
    },
  })
}

export const generateStaticParams = async () => {
  const posts = await getAllPosts()
  const tagCounts = getTagCounts(posts)
  return Object.keys(tagCounts).flatMap((tag) => {
    const postCount = tagCounts[tag]
    const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE))
    return Array.from({ length: totalPages }, (_, i) => ({
      project: encodeURI(tag),
      page: (i + 1).toString(),
    }))
  })
}

export default async function TagPage(props: {
  params: Promise<{ project: string; page: string }>
}) {
  const params = await props.params
  const tag = decodeURI(params.project)
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  const pageNumber = parseInt(params.page)
  const posts = await getAllPosts()
  const filteredPosts = posts.filter(
    (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)
  )
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))

  // Return 404 for invalid page numbers or empty pages
  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }
  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages,
  }

  return (
    <ListLayout
      posts={filteredPosts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={title}
      tagCounts={getTagCounts(posts)}
    />
  )
}
