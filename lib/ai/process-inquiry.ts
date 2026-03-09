import OpenAI from 'openai'

export const PROMPT_VERSION = 'v1.1'

export type LeadCategory = 'hot' | 'warm' | 'cold'

export interface InquiryInput {
    id: string
    name: string
    email: string
    phone: string | null
    message: string
    source: string
    attachments: string | null
    created_at: string
}

export interface AIProcessingResult {
    category: LeadCategory
    confidence: number
    summary: string
    recommended_reply: string
}

export interface AIProcessingResponse {
    result: AIProcessingResult
    raw_response: object
    input_tokens: number
    output_tokens: number
    model_name: string
    prompt_version: string
}

const SYSTEM_PROMPT = `You are a lead qualification assistant for an enterprise inquiry management system.
Your task is to analyze customer inquiries and classify them with precision.

LANGUAGE RULES:
- You MUST first identify the language of the customer's message and output it in the "detected_language" field (e.g. "English", "Spanish", "French").
- The "summary" field is ALWAYS in English, regardless of the customer's language.
- The "recommended_reply" field MUST be written in the EXACT language identified in "detected_language". This is critical — if detected_language is "English", the entire reply must be in English. Never mix languages.

CATEGORY CLASSIFICATION — assign strictly based on these signal checklists:

"hot" — MUST have at least 2 of these signals:
  • Mentions a specific product, service, or solution by name
  • States a budget, price range, or willingness to pay
  • Provides a timeline or deadline (e.g. "need this by March", "ASAP", "this quarter")
  • Asks about pricing, packages, or contracts
  • Requests a demo, consultation, or meeting
  • Uses action language: "I want to purchase", "we need", "ready to start"
  • Provides detailed project scope or requirements

"warm" — Has some interest signals but lacks urgency or specificity:
  • Asks general questions about capabilities or features
  • Expresses interest but no timeline ("we might need", "exploring options")
  • Compares with alternatives ("how do you compare to X?")
  • Requests general information or documentation
  • Shows relevance to your services but without commitment language

"cold" — Assign when ANY of these apply:
  • Generic greetings with no substance ("hello", "hi there")
  • Clearly not a potential buyer (job seekers, surveys, unrelated topics)
  • Spam-like content or automated messages
  • Purely informational with zero purchase signal
  • Complaints or issues unrelated to new business
  • Single-word or extremely vague messages with no actionable content

CONFIDENCE SCORING — reflects how clearly the message fits the assigned category:
  • 0.9–1.0: Unmistakable fit. Multiple strong signals for the category, no ambiguity.
  • 0.7–0.89: Clear fit. Primary signals present, minor ambiguity possible.
  • 0.5–0.69: Moderate fit. Some signals present but mixed or incomplete.
  • 0.3–0.49: Weak fit. Few signals, could arguably belong to an adjacent category.
  • 0.0–0.29: Very uncertain. Minimal signals, assigned by best guess.
Do NOT default to 0.5. Score based on actual evidence in the message.

SUMMARY REQUIREMENTS:
- 1–3 sentences in English.
- MUST mention the specific product/service need if stated.
- MUST note urgency signals if present (timeline, budget, deadlines).
- MUST describe what the customer is looking for, not just that they "made an inquiry".

RECOMMENDED REPLY REQUIREMENTS:
- Written in the SAME language the customer used.
- MUST address the customer's specific ask or need directly.
- Include a concrete next step (e.g. schedule a call, send pricing, request more details).
- Professional and warm tone. Personalize using the customer's name and details.
- Do NOT write generic template responses. Reference specifics from their message.

You MUST respond with a JSON object. The JSON must match this schema exactly:
{
  "detected_language": "The language the customer wrote in (e.g. English, Spanish, French)",
  "summary": "English summary following the requirements above",
  "category": "hot" | "warm" | "cold",
  "confidence": <number between 0.0 and 1.0>,
  "recommended_reply": "Specific, personalized reply — MUST be in the detected_language"
}`

function buildUserMessage(inquiry: InquiryInput): string {
    return `Analyze the following customer inquiry:

Name: ${inquiry.name}
Email: ${inquiry.email}
Phone: ${inquiry.phone ?? 'Not provided'}
Source: ${inquiry.source}
Message:
${inquiry.message}`
}

export async function processInquiry(inquiry: InquiryInput): Promise<AIProcessingResponse> {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const modelName = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

    const response = await client.chat.completions.create({
        model: modelName,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserMessage(inquiry) },
        ],
        temperature: 0.4,
    })

    const rawText = response.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(rawText) as Record<string, unknown>

    // Validate category
    const category = parsed.category as string
    if (!['hot', 'warm', 'cold'].includes(category)) {
        throw new Error(`Invalid category from AI: "${category}"`)
    }

    // Validate and clamp confidence
    const confidence = Math.min(1, Math.max(0, Number(parsed.confidence ?? 0)))

    // Validate required strings
    const summary = String(parsed.summary ?? '').trim()
    const recommended_reply = String(parsed.recommended_reply ?? '').trim()
    if (!summary) throw new Error('AI returned empty summary')
    if (!recommended_reply) throw new Error('AI returned empty recommended_reply')

    return {
        result: {
            category: category as LeadCategory,
            confidence,
            summary,
            recommended_reply,
        },
        raw_response: parsed,
        input_tokens: response.usage?.prompt_tokens ?? 0,
        output_tokens: response.usage?.completion_tokens ?? 0,
        model_name: modelName,
        prompt_version: PROMPT_VERSION,
    }
}
