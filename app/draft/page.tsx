// app/draft/page.tsx でも /draft/[[...all]]/page.tsx でも可
'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { DraftPreviewResponse } from '@/lib/posts'

export default function DraftPreviewPage() {
  const sp = useSearchParams()
  const [data, setData] = useState<DraftPreviewResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = sp.get('id')
    const draftKey = sp.get('draftKey')
    if (!id || !draftKey) return
    ;(async () => {
      const res = await fetch(`/api/draft?id=${id}&draftKey=${draftKey}`, { cache: 'no-store' })
      const json = await res.json()
      setData(json)
      setLoading(false)
    })()
  }, [sp])

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
