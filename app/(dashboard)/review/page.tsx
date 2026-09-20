export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Document } from '@/lib/types/document'
import ReviewQueue from '@/components/ReviewQueue'

export default async function ReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('status', 'review')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
        <p className="text-gray-500 text-sm mt-1">Documents Claude flagged for manual review (confidence below 70%).</p>
      </div>
      <ReviewQueue documents={(documents ?? []) as Document[]} />
    </div>
  )
}
