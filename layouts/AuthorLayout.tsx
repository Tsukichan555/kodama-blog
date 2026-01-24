import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, bluesky, linkedin, github } = content

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="[row-gap:0.5rem] [padding-block-end:var(--spacing-section-bottom)] [padding-block-start:var(--spacing-section-top)] md:[row-gap:1.25rem]">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            About
          </h1>
        </div>
        <div className="items-start [row-gap:0.5rem] xl:grid xl:grid-cols-3 xl:[column-gap:var(--spacing-section-bottom)] xl:[row-gap:0]">
          <div className="flex flex-col items-center [column-gap:0.5rem] [padding-block-start:var(--spacing-section-bottom)]">
            {avatar && (
              <Image
                src={avatar}
                alt="avatar"
                width={192}
                height={192}
                className="[height:12rem] [width:12rem] [border-radius:var(--radius-full)]"
              />
            )}
            <h3 className="text-2xl leading-8 font-bold tracking-tight [padding-block-end:0.5rem] [padding-block-start:1rem]">
              {name}
            </h3>
            <div className="text-gray-500 dark:text-gray-400">{occupation}</div>
            <div className="text-gray-500 dark:text-gray-400">{company}</div>
            <div className="flex [column-gap:0.75rem] [padding-block-start:var(--spacing-section-y)]">
              <SocialIcon kind="mail" href={`mailto:${email}`} />
              <SocialIcon kind="github" href={github} />
              <SocialIcon kind="linkedin" href={linkedin} />
              <SocialIcon kind="x" href={twitter} />
              <SocialIcon kind="bluesky" href={bluesky} />
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none [padding-block:var(--spacing-section-bottom)] xl:col-span-2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
