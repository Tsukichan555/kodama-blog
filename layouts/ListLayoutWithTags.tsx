'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { type BlogListItem } from '@/lib/posts'
import Image from '@/components/Image'

const formatDateYMD = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

const getHeroImageUrl = (heroImage?: BlogListItem['heroImage']) => {
  if (!heroImage) {
    return null
  }
  if (typeof heroImage === 'string') {
    return heroImage
  }
  return heroImage.url || null
}

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: BlogListItem[]
  title: string
  initialDisplayPosts?: BlogListItem[]
  pagination?: PaginationProps
  tagCounts?: Record<string, number>
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const lastSegment = segments[segments.length - 1]
  const basePath = pathname
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/page\/\d+\/?$/, '') // Remove any trailing /page
    .replace(/\/$/, '') // Remove trailing slash
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
  tagCounts,
}: ListLayoutProps) {
  const pathname = usePathname()
  const providedTagCounts =
    tagCounts ||
    posts.reduce<Record<string, number>>((acc, post) => {
      post.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    }, {})
  const tagKeys = Object.keys(providedTagCounts)
  const sortedTags = tagKeys.sort((a, b) => providedTagCounts[b] - providedTagCounts[a])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <div>
        <div className="pt-6 pb-6">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
        </div>
        <div className="flex sm:space-x-24">
          <div className="hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded-sm bg-gray-50 pt-5 shadow-md sm:flex dark:bg-gray-900/70 dark:shadow-gray-800/40">
            <div className="px-6 py-4">
              {pathname.startsWith('/blog') ? (
                <h3 className="text-primary-500 font-bold uppercase">All Posts</h3>
              ) : (
                <Link
                  href={`/blog`}
                  className="hover:text-primary-500 dark:hover:text-primary-500 font-bold text-gray-700 uppercase dark:text-gray-300"
                >
                  All Posts
                </Link>
              )}
              <ul>
                {sortedTags.map((t) => {
                  const count = providedTagCounts[t]
                  return (
                    <li key={t} className="my-3">
                      {decodeURI(pathname.split('/projects/')[1] || '') === slug(t) ? (
                        <h3 className="text-primary-500 inline px-3 py-2 text-sm font-bold uppercase">
                          {`${t} (${count})`}
                        </h3>
                      ) : (
                        <Link
                          href={`/projects/${slug(t)}`}
                          className="hover:text-primary-500 dark:hover:text-primary-500 px-3 py-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-300"
                          aria-label={`View posts tagged ${t}`}
                        >
                          {`${t} (${count})`}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          <div>
            <ul>
              {displayPosts.map((post) => {
                const {
                  slug: postSlug,
                  createdAt,
                  title: postTitle,
                  summary,
                  tags,
                  heroImage,
                } = post
                const imageUrl = getHeroImageUrl(heroImage)
                return (
                  <li key={postSlug} className="py-5">
                    <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-stretch xl:space-y-0">
                      <div className="pr-4">
                        <div className="relative aspect-[4/3] w-full overflow-hidden xl:aspect-auto xl:h-full">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={postTitle}
                              fill
                              sizes="(min-width: 1280px) 25vw, 100vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-100 dark:bg-gray-800" />
                          )}
                          <div className="pointer-events-none absolute inset-0 bg-black/20" />
                        </div>
                      </div>
                      <div className="space-y-3 xl:col-span-3">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/blog/${postSlug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {postTitle}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags?.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                        <div className="flex items-center justify-between text-base leading-6 font-medium">
                          <time
                            dateTime={createdAt}
                            suppressHydrationWarning
                            className="text-gray-500 dark:text-gray-400"
                          >
                            {formatDateYMD(createdAt)}
                          </time>
                          <Link
                            href={`/blog/${postSlug}`}
                            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            aria-label={`Read more: "${postTitle}"`}
                          >
                            Read more &rarr;
                          </Link>
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
