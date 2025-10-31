import { Authors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import SectionContainer from '@/components/SectionContainer'
import PageTitle from '@/components/PageTitle'
import { genPageMetadata } from 'app/seo'
import { getAboutContent } from '@/lib/posts'

export const metadata = genPageMetadata({ title: 'About' })

export default async function Page() {
  const data = await getAboutContent()

  if (data.source === 'microcms') {
    return (
      <SectionContainer>
        <div className="space-y-8">
          <div className="space-y-2 pt-6 pb-8 md:space-y-5">
            <PageTitle>About</PageTitle>
          </div>
          {data.contentHtml && data.contentHtml.trim() ? (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: data.contentHtml }}
            />
          ) : (
            <div className="prose dark:prose-invert max-w-none" />
          )}
        </div>
      </SectionContainer>
    )
  }

  const author = data.author as Authors

  return (
    <AuthorLayout content={data.content}>
      <MDXLayoutRenderer code={author.body.code} />
    </AuthorLayout>
  )
}
