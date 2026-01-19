import 'css/shiki.css'
import 'katex/dist/katex.css'

import { notFound } from 'next/navigation'
import MicroCMSPostLayout from '@/layouts/MicroCMSPostLayout'
import { getDraftPost, getAllPosts, type BlogListItem } from '@/lib/posts'

type DraftSearchParams = { [key: string]: string | string[] | undefined }

const getSingleParam = (value: string | string[] | undefined) => {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

export default async function DraftPreviewPage({
  searchParams,
}: {
  searchParams: Promise<DraftSearchParams>
}) {
  const resolvedParams = await searchParams
  const id = getSingleParam(resolvedParams?.id)
  const draftKey = getSingleParam(resolvedParams?.draftKey)

  if (!id || !draftKey) {
    return notFound()
  }

  let data
  try {
    data = await getDraftPost({ id, draftKey })
  } catch {
    return notFound()
  }

  const { post } = data

  let prev: BlogListItem | undefined
  let next: BlogListItem | undefined

  try {
    const posts = await getAllPosts()
    const index = posts.findIndex((item) => item.slug === post.slug)
    if (index !== -1) {
      prev = index + 1 < posts.length ? posts[index + 1] : undefined
      next = index - 1 >= 0 ? posts[index - 1] : undefined
    }
  } catch {
    // Fallback to rendering the draft post without navigation
  }

  return <MicroCMSPostLayout post={post} prev={prev} next={next} />
}
