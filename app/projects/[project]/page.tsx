import { slug } from 'github-slugger'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { buildCanonicalUrl, genPageMetadata } from 'app/seo'
import { Metadata } from 'next'
import { getAllPosts, getTagCounts } from '@/lib/posts'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: {
  params: Promise<{ project: string }>
}): Promise<Metadata> {
  const params = await props.params
  const tag = decodeURI(params.project)
  const tagSlug = slug(tag)
  const path = `/projects/${tagSlug}`
  return genPageMetadata({
    title: tag,
    description: `${siteMetadata.title} ${tag} tagged content`,
    path,
    alternates: {
      types: {
        'application/rss+xml': buildCanonicalUrl(`${path}/feed.xml`),
      },
    },
  })
}

export const generateStaticParams = async () => {
  const posts = await getAllPosts()
  const tagCounts = getTagCounts(posts)
  const tagKeys = Object.keys(tagCounts)
  return tagKeys.map((tag) => ({
    project: encodeURI(tag),
  }))
}

export default async function TagPage(props: { params: Promise<{ project: string }> }) {
  const params = await props.params
  const tag = decodeURI(params.project)
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  const posts = await getAllPosts()
  const filteredPosts = posts.filter(
    (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)
  )
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const initialDisplayPosts = filteredPosts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
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
