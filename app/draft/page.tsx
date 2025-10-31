// app/draft/page.tsx でも /draft/[[...all]]/page.tsx でも可
'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { DraftPreviewResponse } from '@/lib/posts'

function DraftPreviewContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<DraftPreviewResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = searchParams.get('id')
    const draftKey = searchParams.get('draftKey')
    if (!id || !draftKey) return

    setLoading(true)
    ;(async () => {
      const res = await fetch(`/api/draft?id=${id}&draftKey=${draftKey}`, { cache: 'no-store' })
      const json = await res.json()
      setData(json)
      setLoading(false)
    })()
  }, [searchParams])

  if (loading) return <p>loading…</p>
  if (!data) return <p>not found</p>

  const { post } = data
  return (
    <main>
      <h1>{post.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </main>
  )
}

export default function DraftPreviewPage() {
  return (
    <Suspense fallback={<p>loading…</p>}>
      <DraftPreviewContent />
    </Suspense>
  )
}
