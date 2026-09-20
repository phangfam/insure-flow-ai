import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const EXTRACTION_TOOL = {
  name: 'extract_insurance_form',
  description: 'Extract structured data from a Malaysian insurance form',
  input_schema: {
    type: 'object' as const,
    properties: {
      form_type: {
        type: 'string',
        enum: ['NOMINEE', 'SURRENDER', 'DEATH_CLAIM', 'PSF06A', 'MEDICAL', 'NEW_POLICY', 'UNKNOWN'],
        description: 'The type of insurance form',
      },
      life_assured_name: { type: 'string', description: 'Full name of the life assured / policy holder' },
      nric: { type: 'string', description: 'Malaysian IC number (e.g. 850101-14-1234)' },
      policy_no: { type: 'string', description: 'Policy number' },
      agent_name: { type: 'string', description: 'Agent name if present' },
      confidence_score: { type: 'number', description: 'Extraction confidence 0-1' },
      key_details: { type: 'object', description: 'Any other relevant fields extracted' },
    },
    required: ['form_type', 'confidence_score'],
  },
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()

  const anonClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )

  const { data: { user }, error: authError } = await anonClient.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buf = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const storagePath = `${user.id}/${Date.now()}-${file.name}`

  const { error: uploadError } = await adminClient.storage
    .from('documents')
    .upload(storagePath, buf, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: `Storage error: ${uploadError.message}` }, { status: 500 })
  }

  let extracted: Record<string, unknown> = {}
  let status: 'filed' | 'review' | 'error' = 'review'

  try {
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
    const isPdf = ext === 'pdf'
    type MediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'application/pdf'
    const mediaTypeMap: Record<string, MediaType> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf',
    }

    const messages: Anthropic.MessageParam[] = []

    if (isImage) {
      const b64 = buf.toString('base64')
      const mediaType = (mediaTypeMap[ext] ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      messages.push({
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } },
          { type: 'text', text: 'Extract all insurance form data from this document using the extract_insurance_form tool.' },
        ],
      })
    } else if (isPdf) {
      const b64 = buf.toString('base64')
      messages.push({
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } } as unknown as Anthropic.TextBlockParam,
          { type: 'text', text: 'Extract all insurance form data from this PDF using the extract_insurance_form tool.' },
        ],
      })
    } else {
      messages.push({
        role: 'user',
        content: `Extract insurance form data from file: ${file.name}. Use the extract_insurance_form tool.`,
      })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      tools: [EXTRACTION_TOOL],
      tool_choice: { type: 'any' },
      messages,
    })

    const toolUse = response.content.find(b => b.type === 'tool_use')
    if (toolUse && toolUse.type === 'tool_use') {
      extracted = toolUse.input as Record<string, unknown>
      const confidence = (extracted.confidence_score as number) ?? 0
      status = confidence >= 0.7 ? 'filed' : 'review'
    }
  } catch (claudeErr) {
    console.error('Claude extraction error:', claudeErr)
    status = 'error'
  }

  const { data: doc, error: dbError } = await adminClient
    .from('documents')
    .insert({
      user_id: user.id,
      file_name: file.name,
      storage_path: storagePath,
      form_type: (extracted.form_type as string) ?? 'UNKNOWN',
      status,
      confidence_score: (extracted.confidence_score as number) ?? null,
      life_assured_name: (extracted.life_assured_name as string) ?? null,
      nric: (extracted.nric as string) ?? null,
      policy_no: (extracted.policy_no as string) ?? null,
      agent_name: (extracted.agent_name as string) ?? null,
      key_details: (extracted.key_details as Record<string, unknown>) ?? null,
      extracted_data: extracted,
    })
    .select()
    .single()

  if (dbError) {
    console.error('DB insert error:', dbError)
    return NextResponse.json({ error: `DB error: ${dbError.message}` }, { status: 500 })
  }

  return NextResponse.json({ document: doc, status })
}
