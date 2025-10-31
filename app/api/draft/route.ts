// app/api/draft/route.ts
import { NextResponse } from 'next/server'
import { getDraftPost, type DraftPreviewResponse } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const draftKey = searchParams.get('draftKey')

  if (!id || !draftKey) {
    return NextResponse.json({ error: 'missing query parameter' }, { status: 400 })
  }

  try {
    const data = await getDraftPost({ id, draftKey })
    return NextResponse.json<DraftPreviewResponse>(data, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'failed to fetch draft' }, { status: 500 })
  }
}
