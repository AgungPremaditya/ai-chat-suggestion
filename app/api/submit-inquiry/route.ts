import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, email, phone, message, consent, user_agent, attachments, website } = body

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

    // Get IP address from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : null

    const supabase = await createClient()

    // Rate limit: max 5 submissions per IP per hour
    if (ipAddress) {
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

    const { error: insertError } = await supabase.from('inquiries').insert({
      name,
      email,
      phone: phone || null,
      message,
      consent,
      source: 'web',
      user_agent: user_agent || null,
      ip_address: ipAddress,
      attachments: attachments || null,
    })

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
