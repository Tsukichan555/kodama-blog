import Link from '@/components/Link'
import ProjectLink from '@/components/ProjectLink'
import { slug } from 'github-slugger'
import { genPageMetadata } from 'app/seo'
import { getAllPosts, getProjectCounts } from '@/lib/posts'

export const metadata = genPageMetadata({
  title: 'Projects',
  description: 'Things I blog about',
  path: '/projects',
})

export default async function Page() {
  const posts = await getAllPosts()
  const projectCounts = getProjectCounts(posts)
  const projectKeys = Object.keys(projectCounts)
  const sortedProjects = projectKeys.sort((a, b) => projectCounts[b] - projectCounts[a])
  return (
    <>
      <div className="flex flex-col items-start justify-start divide-y divide-gray-200 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0 dark:divide-gray-700">
        <div className="space-x-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
            Projects
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
          {projectKeys.length === 0 && 'No projects found.'}
          {sortedProjects.map((project) => {
            return (
              <div key={project} className="mt-2 mr-5 mb-2">
                <ProjectLink text={project} />
                <Link
                  href={`/projects/${slug(project)}`}
                  className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
                  aria-label={`View posts in project ${project}`}
                >
                  {` (${projectCounts[project]})`}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
