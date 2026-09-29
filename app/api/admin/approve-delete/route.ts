import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const formData = await request.formData()
  const requestId = formData.get('requestId') as string
  const documentId = formData.get('documentId') as string
  const action = formData.get('action') as 'approve' | 'reject'

  if (!requestId || !documentId || !action) {
    return NextResponse.redirect(new URL('/admin?error=missing-params', request.url))
  }

  if (action === 'approve') {
    // Delete the actual document record
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('document delete error:', deleteError)
      return NextResponse.redirect(new URL('/admin?error=delete-failed', request.url))
    }
  }

  // Mark the request as approved or rejected
  await supabase
    .from('delete_requests')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  return NextResponse.redirect(new URL('/admin?success=' + action, request.url))
}
