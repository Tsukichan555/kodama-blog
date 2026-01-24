import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import AirplaneIcon from '@/components/AirplaneIcon'
import siteMetadata from '@/data/siteMetadata'

const formatDateYYMMDD = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
}

export default function PostLayout({ content, next, prev, children }: LayoutProps) {
  const { path, slug, date, lastmod, title } = content
  const createdAt = date
  const revisedAt = lastmod || date
  const showUpdatedAt = Boolean(lastmod)

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div>
          <header>
            <div className="[row-gap:0.25rem] border-b border-gray-200 text-center [padding-block-end:2.5rem] dark:border-gray-700">
              <dl>
                <div>
                  <dt className="sr-only">Created at</dt>
                  {showUpdatedAt ? <dt className="sr-only">Revised at</dt> : null}
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <div>
                      <time dateTime={createdAt}>
                        {`created at ${formatDateYYMMDD(createdAt)}`}
                      </time>
                    </div>
                    {showUpdatedAt ? (
                      <div>
                        <time dateTime={revisedAt}>
                          {`revised at ${formatDateYYMMDD(revisedAt)}`}
                        </time>
                      </div>
                    ) : null}
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
            </div>
          </header>
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 [padding-block-end:var(--spacing-section-bottom)] xl:divide-y-0 dark:divide-gray-700">
            <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:[padding-block-end:0] dark:divide-gray-700">
              <div className="prose dark:prose-invert max-w-none [padding-block-end:var(--spacing-section-bottom)] [padding-block-start:2.5rem]">
                {children}
              </div>
            </div>
            {siteMetadata.comments && (
              <div
                className="[padding-block:var(--spacing-section-y)] text-center text-gray-700 dark:text-gray-300"
                id="comment"
              >
                <Comments slug={slug} />
              </div>
            )}
            <footer>
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {prev && prev.path && (
                  <div className="[padding-block-start:1rem] xl:[padding-block-start:var(--spacing-section-bottom)]">
                    <Link
                      href={`/${prev.path}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 flex flex-row [gap:0.5rem]"
                      aria-label={`Previous post: ${prev.title}`}
                    >
                      <AirplaneIcon direction="left" /> {prev.title}
                    </Link>
                  </div>
                )}
                {next && next.path && (
                  <div className="[padding-block-start:1rem] xl:[padding-block-start:var(--spacing-section-bottom)]">
                    <Link
                      href={`/${next.path}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Next post: ${next.title}`}
                    >
                      {next.title} &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
