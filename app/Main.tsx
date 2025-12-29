import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { type BlogListItem } from '@/lib/posts'
import Image from '@/components/Image'
import AirplaneIcon from '@/components/AirplaneIcon'

const MAX_DISPLAY = 5

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

export default function Home({ posts }: { posts: BlogListItem[] }) {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Lockhoda Martin
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags, heroImage } = post
            const imageUrl = getHeroImageUrl(heroImage)
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-stretch xl:space-y-0">
                    <div className="pr-4">
                      <div className="relative aspect-[4/3] w-full overflow-hidden xl:aspect-auto xl:h-full">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={title}
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
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-base leading-6 font-medium">
                        <time dateTime={date} className="text-gray-500 dark:text-gray-400">
                          {formatDateYMD(date)}
                        </time>
                        <Link
                          href={`/blog/${slug}`}
                          className="group text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mr-8 inline-flex items-center gap-2"
                          aria-label={`Read more: "${title}"`}
                        >
                          <span>Read more</span>
                          <AirplaneIcon className="transition-transform duration-150 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
    </>
  )
}
