import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, email, phone, message, consent, attachments, website } = body

    // Honeypot: bots fill this field, humans don't see it
    if (website) {
      // Silently accept to not reveal detection
      return NextResponse.json({ success: true })
    }

    if (!name || !email || !message || !consent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Captured server-side only — used for spam prevention, never exposed in UI
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : null
    const userAgent = request.headers.get('user-agent')

    const supabase = await createClient()

    // Rate limit: max 5 submissions per IP per hour (skip for localhost)
    const isLocalhost = !ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1'
    if (ipAddress && !isLocalhost) {
      const { data: allowed, error: rpcError } = await supabase.rpc('check_rate_limit', {
        p_ip: ipAddress,
      })

      if (rpcError) {
        console.error('Rate limit check failed:', rpcError.message)
      } else if (!allowed) {
        return NextResponse.json(
          { error: 'Too many submissions. Please try again later.' },
          { status: 429 }
        )
      }
    }

    // Generate ID server-side to avoid needing SELECT permission after insert
    const inquiryId = crypto.randomUUID()

    const { error: insertError } = await supabase.from('inquiries').insert({
      id: inquiryId,
      name,
      email,
      phone: phone || null,
      message,
      consent,
      source: 'web',
      user_agent: userAgent,
      ip_address: ipAddress,
      attachments: attachments || null,
    })

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    // Fire-and-forget: trigger AI processing without blocking the user response
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (request.headers.get('origin') ?? 'http://localhost:3000')
    fetch(`${baseUrl}/api/process-inquiry/${inquiryId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.PROCESS_INQUIRY_SECRET}` },
    }).catch((err) => {
      console.error('[submit-inquiry] Failed to trigger AI processing:', err)
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
