export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Document, FORM_TYPE_LABELS } from '@/lib/types/document'
import Link from 'next/link'

// Detect duplicates: same life_assured_name + form_type + policy_no, different id
function findDuplicateGroups(docs: Document[]): Set<string> {
  const seen: Record<string, string[]> = {}
  for (const doc of docs) {
    const key = `${(doc.life_assured_name ?? '').toLowerCase()}|${doc.form_type}|${doc.policy_no ?? ''}`
    if (!seen[key]) seen[key] = []
    seen[key].push(doc.id)
  }
  const dupeIds = new Set<string>()
  for (const ids of Object.values(seen)) {
    if (ids.length > 1) ids.forEach(id => dupeIds.add(id))
  }
  return dupeIds
}

export default async function ClientProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  const supabase = await createClient()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .ilike('life_assured_name', decodedName)
    .order('created_at', { ascending: false })

  const docs = (documents ?? []) as Document[]
  const duplicateIds = findDuplicateGroups(docs)

  const filed = docs.filter(d => d.status === 'filed').length
  const review = docs.filter(d => d.status === 'review').length
  const error = docs.filter(d => d.status === 'error').length

  const formCounts: Record<string, number> = {}
  for (const doc of docs) {
    formCounts[doc.form_type] = (formCounts[doc.form_type] ?? 0) + 1
  }

  const statusBadge = (s: string) => {
    if (s === 'filed') return 'bg-green-100 text-green-700'
    if (s === 'review') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Back to Dashboard</Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{decodedName}</h1>
        {docs[0]?.nric && (
          <p className="text-sm text-gray-500 font-mono mt-0.5">NRIC: {docs[0].nric}</p>
        )}
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: docs.length, color: 'text-gray-900', bg: 'bg-white', border: 'border-gray-200' },
          { label: 'Filed', value: filed, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
          { label: 'Pending Review', value: review, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
          { label: 'Error', value: error, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} px-5 py-4`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Duplicate warning banner */}
      {duplicateIds.size > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-5 py-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Possible duplicate entries detected</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {duplicateIds.size} document{duplicateIds.size > 1 ? 's' : ''} share the same form type and policy number.
              Rows marked <span className="font-mono bg-amber-100 px-1 rounded">DUPE</span> below may be duplicates.
              Contact your admin to request deletion — all deletions require human approval.
            </p>
          </div>
        </div>
      )}

      {/* Form type summary */}
      {Object.keys(formCounts).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Form Types</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(formCounts).map(([type, count]) => (
              <span key={type} className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                {(FORM_TYPE_LABELS as Record<string, string>)[type] ?? type} × {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Documents table */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">All Documents</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {docs.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">No documents found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  {['File', 'Form Type', 'Policy No', 'Agent', 'Status', 'Uploaded', ''].map((h, i) => (
                    <th key={i} className="px-4 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {docs.map(doc => {
                  const isDupe = duplicateIds.has(doc.id)
                  return (
                    <tr key={doc.id} className={isDupe ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-2 max-w-xs truncate font-medium text-gray-900">{doc.file_name}</td>
                      <td className="px-4 py-2 text-gray-600">{(FORM_TYPE_LABELS as Record<string, string>)[doc.form_type] ?? doc.form_type}</td>
                      <td className="px-4 py-2 text-gray-500 font-mono text-xs">{doc.policy_no ?? '-'}</td>
                      <td className="px-4 py-2 text-gray-600">{doc.agent_name ?? '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(doc.status)}`}>{doc.status}</span>
                      </td>
                      <td className="px-4 py-2 text-gray-400 text-xs">{new Date(doc.created_at).toLocaleDateString('en-MY')}</td>
                      <td className="px-4 py-2">
                        {isDupe && (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                            DUPE
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        {duplicateIds.size > 0 && (
          <p className="mt-2 text-xs text-gray-400">
            ℹ️ To delete duplicate entries, ask your admin. All deletions require human approval before any record is removed.
          </p>
        )}
      </div>
    </div>
  )
}
