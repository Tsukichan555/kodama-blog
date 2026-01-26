import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayoutWithProjects'
import { getAllPosts, getProjectCounts } from '@/lib/posts'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Blog', path: '/blog' })

export default async function BlogPage() {
  const posts = await getAllPosts()
  const pageNumber = 1
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE * pageNumber)
  const pagination = {
    currentPage: pageNumber,
    totalPages,
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="All Posts"
      projectCounts={getProjectCounts(posts)}
    />
  )
}
