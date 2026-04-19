import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

// Intentionally loose — we let Resend do the authoritative validation.
// This guards against obviously malformed input before hitting the network.
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (!apiKey || !audienceId) {
    return NextResponse.json({ error: 'Newsletter not configured' }, { status: 503 })
  }

  let email: string
  try {
    const body: unknown = await req.json()
    if (!body || typeof body !== 'object' || !('email' in body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    email = String((body as Record<string, unknown>).email)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  email = email.trim().toLowerCase()

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 422 })
  }

  const resend = new Resend(apiKey)

  try {
    await resend.contacts.create({ audienceId, email, unsubscribed: false })
  } catch (err) {
    // Resend returns a 409-like error when the contact already exists.
    // Treat this as success to avoid email enumeration.
    const msg = err instanceof Error ? err.message : String(err)
    if (!msg.toLowerCase().includes('already')) {
      console.error('[newsletter/subscribe] failed:', err)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 502 })
    }
  }

  return NextResponse.json({ ok: true })
}
