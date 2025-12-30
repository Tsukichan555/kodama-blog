import Link from '@/components/Link'
import SectionContainer from '@/components/SectionContainer'
import Tag from '@/components/Tag'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
//import Comments from '@/components/Comments'
import Image from '@/components/Image'
import type { BlogListItem, MicroCMSBlogDetail } from '@/lib/posts'
import AirplaneIcon from '@/components/AirplaneIcon'

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

interface MicroCMSPostLayoutProps {
  post: MicroCMSBlogDetail
  prev?: BlogListItem
  next?: BlogListItem
}

export default function MicroCMSPostLayout({ post, prev, next }: MicroCMSPostLayoutProps) {
  const { slug, title, tags, publishedAt, updatedAt, contentHtml, heroImage } = post
  const displayUpdatedAt = updatedAt || publishedAt

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published at</dt>
                  <dt className="sr-only">Updated at</dt>
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <div>
                      <time dateTime={publishedAt}>
                        {`published at ${formatDateYYMMDD(publishedAt)}`}
                      </time>
                    </div>
                    <div>
                      <time dateTime={displayUpdatedAt}>
                        {`updated at ${formatDateYYMMDD(displayUpdatedAt)}`}
                      </time>
                    </div>
                  </dd>
                </div>
              </dl>
              <div>
                <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-tight dark:text-gray-100">
                  {title}
                </h1>
              </div>
              {heroImage?.url && (
                <div className="mt-8 flex justify-center">
                  <Image
                    src={heroImage.url}
                    width={heroImage.width || 1200}
                    height={heroImage.height || 630}
                    alt={title}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
          </header>
          <div className="divide-y divide-gray-200 pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0 dark:divide-gray-700">
            <div className="xl:col-span-3 xl:row-span-2">
              {contentHtml && contentHtml.trim() ? (
                <div
                  className="prose dark:prose-invert max-w-none pt-10 pb-8"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none pt-10 pb-8" />
              )}
              {/* {siteMetadata.comments && (
                <div
                  className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300"
                  id="comment"
                >
                  <Comments slug={slug} />
                </div>
              )} */}
            </div>
            <aside className="xl:col-start-4 xl:row-span-2 xl:pt-10">
              {tags.length > 0 && (
                <div className="pb-6">
                  <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Tags
                  </h2>
                  <div className="flex flex-wrap pt-2">
                    {tags.map((tag) => (
                      <Tag key={tag} text={tag} />
                    ))}
                  </div>
                </div>
              )}
              {(prev || next) && (
                <div className="space-y-8">
                  {prev && (
                    <div>
                      <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        Previous Article
                      </h2>
                      <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                        <Link href={`/blog/${prev.slug}`}>{prev.title}</Link>
                      </div>
                    </div>
                  )}
                  {next && (
                    <div>
                      <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        Next Article
                      </h2>
                      <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                        <Link href={`/blog/${next.slug}`}>{next.title}</Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="pt-6">
                <Link
                  href="/blog"
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 flex flex-row gap-2"
                  aria-label="Back to the blog"
                >
                  <AirplaneIcon direction="left" /> Back to the blog
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
