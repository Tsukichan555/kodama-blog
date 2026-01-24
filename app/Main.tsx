import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { type AboutContentResult, type BlogListItem } from '@/lib/posts'
import Image from '@/components/Image'
import AirplaneIcon from '@/components/AirplaneIcon'
import { Plane } from 'lucide-react'

const MAX_DISPLAY = 5
const MAX_DESC_LENGTH = 86

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

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')

const stripMarkdown = (value: string) =>
  value
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, ' ')
    .replace(/[#>*_~=-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const toPlainText = (value: string) => stripMarkdown(stripHtml(value))

const takeChars = (value: string, max: number) => {
  const chars = Array.from(value)
  if (chars.length <= max) {
    return { text: value, truncated: false }
  }
  return { text: chars.slice(0, max).join(''), truncated: true }
}

const getAboutSource = (about?: AboutContentResult) => {
  if (!about) {
    return ''
  }
  if (about.source === 'microcms') {
    return about.contentHtml || ''
  }
  return about.author?.body?.raw || ''
}

export default function Home({
  posts,
  about,
}: {
  posts: BlogListItem[]
  about: AboutContentResult
}) {
  const aboutSource = getAboutSource(about)
  const plainAbout = toPlainText(aboutSource)
  const { text, truncated } = takeChars(plainAbout, MAX_DESC_LENGTH)
  const description = text ? (truncated ? `${text}...` : text) : siteMetadata.description

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="[row-gap:0.5rem] [padding-block-end:var(--spacing-section-bottom)] [padding-block-start:var(--spacing-section-top)] md:[row-gap:1.25rem]">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Lockhoda Martin
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {description}
            <Link
              href="/about"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 [margin-inline-start:0.25rem] font-medium underline"
            >
              Read more
            </Link>
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, createdAt, title, summary, tags, heroImage } = post
            const imageUrl = getHeroImageUrl(heroImage)
            return (
              <li key={slug} className="[padding-block:var(--spacing-footer-y)]">
                <article>
                  <div className="[row-gap:0.5rem] xl:grid xl:grid-cols-4 xl:items-stretch xl:[row-gap:0]">
                    <div className="[padding-inline-end:1rem]">
                      <div className="relative aspect-4/3 w-full overflow-hidden xl:aspect-auto xl:h-full">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            sizes="(min-width: 1280px) 25vw, 100vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-b from-[#C7C8CA99] to-[#C7C8CA20]">
                            <Plane className="opacity-30" />
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-0" />
                      </div>
                    </div>
                    <div className="[row-gap:1.25rem] xl:col-span-3">
                      <div className="[row-gap:1.5rem]">
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
                        <time dateTime={createdAt} className="text-gray-500 dark:text-gray-400">
                          {formatDateYMD(createdAt)}
                        </time>
                        <Link
                          href={`/blog/${slug}`}
                          className="group text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 [margin-inline-end:var(--spacing-section-bottom)] inline-flex items-center [gap:0.5rem]"
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
