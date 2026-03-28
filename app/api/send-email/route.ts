import { createClient } from '@/lib/supabase/server'
import { buildReplyEmailHtml } from '@/lib/email/reply-template'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { to, subject, replyBody, recipientName, originalMessage, originalDate } = await request.json()

        if (!to || !subject || !replyBody || !recipientName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const html = buildReplyEmailHtml({
            recipientName,
            replyBody,
            originalMessage: originalMessage ?? '',
            originalDate: originalDate ?? '',
        })

        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: Number(process.env.MAILTRAP_PORT ?? 587),
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS,
            },
        })

        const info = await transporter.sendMail({
            from: process.env.MAILTRAP_FROM ?? '"Lumina" <noreply@lumina.app>',
            to,
            subject,
            html,
        })

        return NextResponse.json({ success: true, messageId: info.messageId })
    } catch (err) {
        console.error('[send-email] Error:', err)
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        )
    }
}
