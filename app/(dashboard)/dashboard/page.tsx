export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Document } from '@/lib/types/document'
import UploadZone from '@/components/UploadZone'
import DocumentTable from '@/components/DocumentTable'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Index</h1>
        <p className="text-gray-500 text-sm mt-1">Upload insurance forms — Claude AI extracts and files them automatically.</p>
      </div>
      <UploadZone />
      <DocumentTable documents={(documents ?? []) as Document[]} />
    </div>
  )
}
