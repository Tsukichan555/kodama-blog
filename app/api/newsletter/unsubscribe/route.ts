import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

function verifyToken(email: string, token: string): boolean {
  const secret = process.env.RESEND_UNSUBSCRIBE_SECRET
  if (!secret) return false
  const expected = createHmac('sha256', secret).update(email).digest('hex')
  if (token.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

const htmlPage = (heading: string, body: string) => `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${heading}</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb}
.card{background:#fff;border-radius:8px;padding:40px;max-width:400px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.1)}
h1{margin:0 0 12px;font-size:22px;color:#111}p{color:#555;margin:0 0 20px}a{color:#0070f3}</style>
</head><body><div class="card"><h1>${heading}</h1><p>${body}</p></div></body></html>`

// GET — linked from unsubscribe link in email
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = (searchParams.get('email') ?? '').trim().toLowerCase()
  const token = searchParams.get('token') ?? ''

  if (!EMAIL_RE.test(email) || !token) {
    return new NextResponse(htmlPage('無効なリンク', '配信停止リンクが無効です。'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  if (!verifyToken(email, token)) {
    return new NextResponse(htmlPage('無効なリンク', '配信停止リンクが無効または期限切れです。'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (!apiKey || !audienceId) {
    return new NextResponse(
      htmlPage('エラー', 'サーバーの設定に問題があります。しばらく経ってからお試しください。'),
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  try {
    const resend = new Resend(apiKey)
    await resend.contacts.remove({ audienceId, email })
  } catch (err) {
    console.error('[newsletter/unsubscribe] failed:', err)
    return new NextResponse(
      htmlPage('エラー', '配信停止処理に失敗しました。しばらく経ってからお試しください。'),
      { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  return new NextResponse(
    htmlPage('配信停止しました', 'メルマガの配信を停止しました。またいつでも再登録できます。'),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
