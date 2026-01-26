import siteMetadata from '@/data/siteMetadata'
import { slug } from 'github-slugger'
import ListLayout from '@/layouts/ListLayoutWithProjects'
import { notFound } from 'next/navigation'
import { buildCanonicalUrl, genPageMetadata } from 'app/seo'
import { getAllPosts, getProjectCounts } from '@/lib/posts'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: {
  params: Promise<{ project: string; page: string }>
}) {
  const params = await props.params
  const project = decodeURI(params.project)
  const projectSlug = slug(project)
  const pageNumber = parseInt(params.page)
  const isFirstPage = pageNumber === 1
  const path = isFirstPage
    ? `/projects/${projectSlug}`
    : `/projects/${projectSlug}/page/${pageNumber}`

  return genPageMetadata({
    title: isFirstPage ? project : `${project} - Page ${pageNumber}`,
    description: `${siteMetadata.title} ${project} project content`,
    path,
    alternates: {
      types: {
        'application/rss+xml': buildCanonicalUrl(`/projects/${projectSlug}/feed.xml`),
      },
    },
  })
}

export const generateStaticParams = async () => {
  const posts = await getAllPosts()
  const projectCounts = getProjectCounts(posts)
  return Object.keys(projectCounts).flatMap((project) => {
    const postCount = projectCounts[project]
    const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE))
    return Array.from({ length: totalPages }, (_, i) => ({
      project: encodeURI(project),
      page: (i + 1).toString(),
    }))
  })
}

export default async function ProjectPage(props: {
  params: Promise<{ project: string; page: string }>
}) {
  const params = await props.params
  const project = decodeURI(params.project)
  const title = project[0].toUpperCase() + project.split(' ').join('-').slice(1)
  const pageNumber = parseInt(params.page)
  const posts = await getAllPosts()
  const filteredPosts = posts.filter((post) =>
    post.projects?.map((projectName) => slug(projectName)).includes(project)
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
      projectCounts={getProjectCounts(posts)}
    />
  )
}
