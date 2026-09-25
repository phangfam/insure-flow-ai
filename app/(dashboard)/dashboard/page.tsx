export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Document } from '@/lib/types/document'
import UploadZone from '@/components/UploadZone'
import DocumentTable from '@/components/DocumentTable'
import DashboardStats from '@/components/DashboardStats'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  const docs = (documents ?? []) as Document[]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Upload insurance forms — Claude AI extracts and files them automatically.</p>
      </div>
      <DashboardStats documents={docs} />
      <UploadZone />
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">All Documents</h2>
        <DocumentTable documents={docs} />
      </div>
    </div>
  )
}