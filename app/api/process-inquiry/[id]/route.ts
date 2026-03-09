import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { processInquiry, PROMPT_VERSION } from '@/lib/ai/process-inquiry'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    // Auth: valid Supabase session OR internal secret
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        const authHeader = request.headers.get('authorization') ?? ''
        const secret = process.env.PROCESS_INQUIRY_SECRET
        if (!secret || authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const serviceClient = createServiceClient()

    // Fetch inquiry
    const { data: inquiry, error: inquiryError } = await serviceClient
        .from('inquiries')
        .select('id, name, email, phone, message, source, attachments, created_at')
        .eq('id', id)
        .single()

    if (inquiryError || !inquiry) {
        console.error('[process-inquiry] Inquiry fetch failed:', inquiryError?.message)
        return NextResponse.json({ error: `Inquiry not found: ${inquiryError?.message}` }, { status: 404 })
    }

    // Log AI job start
    const { data: job, error: jobError } = await serviceClient
        .from('ai_jobs')
        .insert({
            inquiry_id: id,
            model_name: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
            prompt_version: PROMPT_VERSION,
            started_at: new Date().toISOString(),
            success: false,
        })
        .select('id')
        .single()

    if (jobError || !job) {
        console.error('[process-inquiry] ai_jobs insert failed:', jobError?.message)
        return NextResponse.json({ error: `Failed to create AI job record: ${jobError?.message}` }, { status: 500 })
    }

    try {
        const aiResponse = await processInquiry(inquiry)
        const { result } = aiResponse
        const now = new Date().toISOString()

        // Check if a lead already exists for this inquiry
        const { data: existing } = await serviceClient
            .from('leads')
            .select('id')
            .eq('inquiry_id', id)
            .maybeSingle()

        const leadFields = {
            category: result.category,
            confidence_score: result.confidence,
            summary: result.summary,
            recommended_reply: result.recommended_reply,
            processed_at: now,
            updated_at: now,
        }
        const selectFields = 'id, inquiry_id, category, status, confidence_score, summary, recommended_reply, final_reply, replied_at, processed_at'

        let lead
        if (existing?.id) {
            const { data, error } = await serviceClient
                .from('leads')
                .update(leadFields)
                .eq('id', existing.id)
                .select(selectFields)
                .single()
            if (error) {
                console.error('[process-inquiry] leads update error:', error.message)
                throw new Error(`leads update failed: ${error.message}`)
            }
            lead = data
        } else {
            const { data, error } = await serviceClient
                .from('leads')
                .insert({ inquiry_id: id, ...leadFields })
                .select(selectFields)
                .single()
            if (error) {
                console.error('[process-inquiry] leads insert error:', error.message)
                throw new Error(`leads insert failed: ${error.message}`)
            }
            lead = data
        }

        await serviceClient
            .from('ai_jobs')
            .update({
                input_tokens: aiResponse.input_tokens,
                output_tokens: aiResponse.output_tokens,
                raw_response: aiResponse.raw_response,
                success: true,
                finished_at: now,
            })
            .eq('id', job.id)

        return NextResponse.json({ lead })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'

        await serviceClient
            .from('ai_jobs')
            .update({
                error_message: message,
                success: false,
                finished_at: new Date().toISOString(),
            })
            .eq('id', job.id)

        console.error('[process-inquiry] AI processing failed:', message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
