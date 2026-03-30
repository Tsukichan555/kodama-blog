import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { fetchFromMicroCMS, patchMicroCMS, isMicroCMSEnabled } from '@/lib/microcms/client'

export const dynamic = 'force-dynamic'

// Only allow alphanumeric, hyphens, and underscores to prevent path traversal
const VALID_ID = /^[a-zA-Z0-9_-]+$/

interface MicroCMSLikeEntry {
  id: string
  likeCount?: number
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!VALID_ID.test(id)) {
    return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 })
  }

  if (!isMicroCMSEnabled()) {
    return NextResponse.json({ error: 'microCMS not configured' }, { status: 503 })
  }

  const cookieStore = await cookies()
  const cookieName = `liked_${id}`

  if (cookieStore.get(cookieName)) {
    return NextResponse.json({ error: 'Already liked' }, { status: 409 })
  }

  let currentCount: number
  try {
    const entry = await fetchFromMicroCMS<MicroCMSLikeEntry>(`blog/${id}`, {
      cache: 'no-store',
    })
    currentCount = entry.likeCount ?? 0
  } catch {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 502 })
  }

  const newCount = currentCount + 1

  try {
    await patchMicroCMS(`blog/${id}`, { likeCount: newCount })
  } catch {
    return NextResponse.json({ error: 'Failed to update like count' }, { status: 502 })
  }

  const response = NextResponse.json({ likeCount: newCount })
  response.cookies.set(cookieName, '1', {
    httpOnly: false, // Client-readable so LikeButton can restore liked state on mount
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
