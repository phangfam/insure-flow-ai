export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DocumentEditForm from './DocumentEditForm'

const DARK = '#111827'

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!doc) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: '#6b7280' }}>
        ← Back to Documents
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-black tracking-tight truncate" style={{ color: DARK }}>{doc.file_name}</h1>
          <span className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{
              background: doc.status === 'filed' ? '#f0fdf4' : doc.status === 'review' ? '#fffbeb' : '#fff5f5',
              color: doc.status === 'filed' ? '#16a34a' : doc.status === 'review' ? '#d97706' : '#F45D54',
            }}>
            {doc.status}
          </span>
        </div>
        {doc.status === 'review' && (
          <p className="text-sm mt-1" style={{ color: '#d97706' }}>
            ⚠ AI extraction was uncertain. Please verify and correct the fields below, then save.
          </p>
        )}
      </div>

      {/* Edit form */}
      <DocumentEditForm doc={doc} />
    </div>
  )
}
