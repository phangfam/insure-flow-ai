export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DocumentEditForm from './DocumentEditForm'
import DocumentViewer from './DocumentViewer'

const DARK = '#111827'

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!doc) notFound()

  // Generate a signed URL server-side (1 hour expiry)
  const { data: signedData } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.storage_path, 3600)

  const signedUrl = signedData?.signedUrl ?? null

  const isPdf = doc.file_name?.toLowerCase().endsWith('.pdf')

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: '#6b7280' }}>
        ← Back to Documents
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: file viewer */}
        <div>
          <h2 className="text-base font-bold mb-3" style={{ color: DARK }}>Original Document</h2>
          <DocumentViewer signedUrl={signedUrl} isPdf={isPdf} fileName={doc.file_name} />
        </div>

        {/* Right: extracted fields */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-base font-bold" style={{ color: DARK }}>Extracted Fields</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                background: doc.status === 'filed' ? '#f0fdf4' : doc.status === 'review' ? '#fffbeb' : '#fff5f5',
                color: doc.status === 'filed' ? '#16a34a' : doc.status === 'review' ? '#d97706' : '#F45D54',
              }}>
              {doc.status}
            </span>
          </div>
          {doc.status === 'review' && (
            <p className="text-sm mb-3" style={{ color: '#d97706' }}>
              ⚠ AI was uncertain. Verify against the document on the left, correct any errors, then set status to <strong>filed</strong>.
            </p>
          )}
          <DocumentEditForm doc={doc} />
        </div>
      </div>
    </div>
  )
}
