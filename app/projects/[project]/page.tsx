import { slug } from 'github-slugger'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayoutWithProjects'
import { buildCanonicalUrl, genPageMetadata } from 'app/seo'
import { Metadata } from 'next'
import { getAllPosts, getProjectCounts } from '@/lib/posts'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: {
  params: Promise<{ project: string }>
}): Promise<Metadata> {
  const params = await props.params
  const project = decodeURI(params.project)
  const projectSlug = slug(project)
  const path = `/projects/${projectSlug}`
  return genPageMetadata({
    title: project,
    description: `${siteMetadata.title} ${project} project content`,
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
  const projectCounts = getProjectCounts(posts)
  const projectKeys = Object.keys(projectCounts)
  return projectKeys.map((project) => ({
    project: encodeURI(project),
  }))
}

export default async function ProjectPage(props: { params: Promise<{ project: string }> }) {
  const params = await props.params
  const project = decodeURI(params.project)
  const title = project[0].toUpperCase() + project.split(' ').join('-').slice(1)
  const posts = await getAllPosts()
  const filteredPosts = posts.filter((post) =>
    post.projects?.map((projectName) => slug(projectName)).includes(project)
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
      projectCounts={getProjectCounts(posts)}
    />
  )
}
