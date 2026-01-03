import OpenAI from 'openai'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export interface ExtractionResult {
  summary: string
  personal_facts: string[]
  business_context: string[]
  commitments: string[]
  follow_up_suggestions: string[]
  suggested_opener?: string
}

const EXTRACTION_PROMPT = `You are analyzing a conversation (call transcript or email) between a business and their customer.

Extract structured information from the conversation. Output ONLY valid JSON matching this exact schema:

{
  "summary": "2-4 sentences summarizing the key points of this interaction",
  "personal_facts": ["array of personal details about the customer (family, hobbies, preferences, etc)"],
  "business_context": ["array of business-relevant facts (role, company size, budget, timeline, pain points, etc)"],
  "commitments": ["array of promises or commitments made by either party"],
  "follow_up_suggestions": ["array of actionable next steps, time-bound when possible"],
  "suggested_opener": "optional single sentence opener for the next conversation"
}

Rules:
- DO NOT invent facts. Only include information explicitly stated or clearly implied.
- Keep facts short, concrete, and directly attributable to the conversation.
- Commitments should capture promises made by either party (deadlines, deliverables, callbacks).
- Follow-up suggestions should be actionable and specific.
- If a category has no relevant items, use an empty array [].
- Output ONLY the JSON object, no markdown formatting, no explanation.`

function truncateForContext(text: string, maxChars: number = 5000): string {
  if (text.length <= maxChars) return text

  // Keep first 1000 chars (greetings, context) + last 4000 chars (conclusions, commitments)
  const firstPart = text.slice(0, 1000)
  const lastPart = text.slice(-4000)
  
  return `${firstPart}\n\n[...content truncated for processing...]\n\n${lastPart}`
}

export async function extractFromText(text: string, source: 'call' | 'email'): Promise<ExtractionResult> {
  const truncated = truncateForContext(text)
  
  const sourceContext = source === 'call' 
    ? 'This is a phone call transcript.'
    : 'This is an email conversation.'

  const openai = getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: EXTRACTION_PROMPT },
      { role: 'user', content: `${sourceContext}\n\n---\n\n${truncated}` }
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content in OpenAI response')
  }

  try {
    const parsed = JSON.parse(content) as ExtractionResult
    return {
      summary: parsed.summary || '',
      personal_facts: parsed.personal_facts || [],
      business_context: parsed.business_context || [],
      commitments: parsed.commitments || [],
      follow_up_suggestions: parsed.follow_up_suggestions || [],
      suggested_opener: parsed.suggested_opener,
    }
  } catch {
    console.error('Failed to parse OpenAI response:', content)
    throw new Error('Failed to parse extraction result')
  }
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  // Convert Buffer to Blob for OpenAI API
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/wav' })
  const file = new File([blob], 'audio.wav', { type: 'audio/wav' })
  
  const openai = getOpenAIClient()
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'text',
  })

  return response
}

