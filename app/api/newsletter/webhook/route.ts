import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { Resend } from 'resend'
import { fetchFromMicroCMS, isMicroCMSEnabled } from '@/lib/microcms/client'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-dynamic'

// Resend batch.send accepts up to 100 emails per call
const BATCH_SIZE = 100

interface MicroCMSWebhookBody {
  api?: string
  id?: string
  type?: string
  contents?: {
    new?: {
      id?: string
      publishStatus?: string
    }
  }
}

interface MicroCMSArticle {
  id: string
  title: string
}

interface ResendContact {
  email: string
  unsubscribed: boolean
}

function verifySecret(raw: string, expected: string): boolean {
  if (raw.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(raw), Buffer.from(expected))
  } catch {
    return false
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function buildEmailHtml(title: string, articleUrl: string, unsubscribeUrl: string): string {
  const safeTitle = escapeHtml(title)
  const safeArticleUrl = escapeHtml(articleUrl)
  const safeUnsubUrl = escapeHtml(unsubscribeUrl)

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:40px;max-width:100%">
        <tr><td>
          <h1 style="margin:0 0 8px;font-size:20px;color:#111">新しい記事が公開されました</h1>
          <p style="margin:0 0 24px;font-size:18px;font-weight:600;color:#222">${safeTitle}</p>
          <a href="${safeArticleUrl}"
             style="display:inline-block;padding:12px 24px;background:#0070f3;color:#fff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:500">
            記事を読む
          </a>
          <hr style="margin:40px 0 24px;border:none;border-top:1px solid #eee">
          <p style="margin:0;font-size:12px;color:#999">
            このメールは <a href="${escapeHtml(siteMetadata.siteUrl)}" style="color:#999">${escapeHtml(siteMetadata.siteUrl)}</a> のメルマガに登録されたアドレスへ送信しています。<br>
            配信停止は<a href="${safeUnsubUrl}" style="color:#999">こちら</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function makeUnsubscribeUrl(email: string): string {
  const secret = process.env.RESEND_UNSUBSCRIBE_SECRET
  if (!secret) return siteMetadata.siteUrl
  const token = createHmac('sha256', secret).update(email).digest('hex')
  return `${siteMetadata.siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

export async function POST(req: NextRequest) {
  // --- Auth ---
  const webhookSecret = process.env.MICROCMS_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[newsletter/webhook] MICROCMS_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const incoming = req.headers.get('x-webhook-secret') ?? ''
  if (!verifySecret(incoming, webhookSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // --- Parse body ---
  let body: MicroCMSWebhookBody
  try {
    body = (await req.json()) as MicroCMSWebhookBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only handle new blog publications
  if (body.api !== 'blog' || body.type !== 'new') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const contentId = body.id ?? body.contents?.new?.id
  if (!contentId || !/^[a-zA-Z0-9_-]+$/.test(contentId)) {
    return NextResponse.json({ error: 'Missing or invalid content id' }, { status: 400 })
  }

  // --- Dependencies check ---
  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !audienceId || !fromEmail) {
    console.error('[newsletter/webhook] Resend env vars missing')
    return NextResponse.json({ error: 'Newsletter not configured' }, { status: 503 })
  }

  if (!isMicroCMSEnabled()) {
    return NextResponse.json({ error: 'microCMS not configured' }, { status: 503 })
  }

  // --- Fetch article title from microCMS ---
  let article: MicroCMSArticle
  try {
    article = await fetchFromMicroCMS<MicroCMSArticle>(`blog/${contentId}`, { cache: 'no-store' })
  } catch (err) {
    console.error('[newsletter/webhook] failed to fetch article:', err)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 502 })
  }

  const articleUrl = `${siteMetadata.siteUrl}/blog/${contentId}`

  // --- Fetch subscribers ---
  const resend = new Resend(apiKey)
  let contacts: ResendContact[]
  try {
    const result = await resend.contacts.list({ audienceId })
    contacts = ((result.data as { data?: ResendContact[] } | null)?.data ?? []).filter(
      (c) => !c.unsubscribed
    )
  } catch (err) {
    console.error('[newsletter/webhook] failed to list contacts:', err)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 502 })
  }

  if (contacts.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  // --- Send in batches of BATCH_SIZE ---
  let totalSent = 0
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const chunk = contacts.slice(i, i + BATCH_SIZE)
    const emails = chunk.map((c) => ({
      from: fromEmail,
      to: c.email,
      subject: `新しい記事: ${article.title}`,
      html: buildEmailHtml(article.title, articleUrl, makeUnsubscribeUrl(c.email)),
    }))

    try {
      await resend.batch.send(emails)
      totalSent += chunk.length
    } catch (err) {
      console.error(`[newsletter/webhook] batch send failed at offset ${i}:`, err)
      return NextResponse.json(
        { error: 'Partial send failure', sent: totalSent },
        { status: 502 }
      )
    }
  }

  return NextResponse.json({ ok: true, sent: totalSent })
}
