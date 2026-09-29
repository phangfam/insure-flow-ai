import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const formData = await request.formData()
  const docId = formData.get('docId') as string

  if (!docId) {
    return NextResponse.redirect(new URL('/admin?error=missing-id', request.url))
  }

  // Fetch doc name for the log
  const { data: doc } = await supabase
    .from('documents')
    .select('file_name')
    .eq('id', docId)
    .single()

  // Insert into delete_requests table (approval queue — nothing is deleted here)
  const { error } = await supabase
    .from('delete_requests')
    .insert({
      document_id: docId,
      file_name: doc?.file_name ?? 'unknown',
      requested_at: new Date().toISOString(),
      status: 'pending',
    })

  if (error) {
    console.error('delete_requests insert error:', error)
    return NextResponse.redirect(new URL('/admin?error=queue-failed', request.url))
  }

  return NextResponse.redirect(new URL('/admin?success=delete-requested', request.url))
}
