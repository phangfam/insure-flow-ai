'use client'
import { useState } from 'react'
import { Document, FORM_TYPE_LABELS, FormType } from '@/lib/types/document'

export default function ReviewQueue({ documents }: { documents: Document[] }) {
  const [selected, setSelected] = useState<Document | null>(documents[0] ?? null)
  const [form, setForm] = useState<Partial<Document>>({})
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  async function loadPreview(doc: Document) {
    setSelected(doc)
    setForm({})
    const res = await fetch(`/api/documents/signed-url?path=${encodeURIComponent(doc.storage_path)}`)
    const json = await res.json()
    setPreviewUrl(json.url ?? null)
  }

  async function approve() {
    if (!selected) return
    setSaving(true)
    await fetch('/api/documents/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, ...form }),
    })
    setSaving(false)
    window.location.reload()
  }

  if (!documents.length) return (
    <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center text-gray-400 text-sm">
      No documents in review queue.
    </div>
  )

  return (
    <div className="flex gap-6 h-[calc(100vh-220px)]">
      <div className="w-64 bg-white rounded-xl border border-gray-200 overflow-y-auto flex-shrink-0">
        {documents.map(doc => (
          <button key={doc.id} onClick={() => loadPreview(doc)}
            className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected?.id === doc.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}>
            <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{FORM_TYPE_LABELS[doc.form_type] ?? doc.form_type}</p>
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
        {previewUrl ? (
          <iframe src={previewUrl} className="w-full h-full" title="Document preview" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Select a document to preview
          </div>
        )}
      </div>

      {selected && (
        <div className="w-72 bg-white rounded-xl border border-gray-200 flex-shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Correct extraction</h3>
            <p className="text-xs text-gray-400 mt-0.5">Confidence: {((selected.confidence_score ?? 0) * 100).toFixed(0)}%</p>
          </div>
          <div className="p-4 space-y-3">
            {([
              ['form_type', 'Form Type'],
              ['life_assured_name', 'Life Assured Name'],
              ['nric', 'NRIC'],
              ['policy_no', 'Policy No'],
              ['agent_name', 'Agent Name'],
            ] as [keyof Document, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                {key === 'form_type' ? (
                  <select
                    value={(form[key] as string) ?? (selected[key] as string) ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {(Object.keys(FORM_TYPE_LABELS) as FormType[]).map(ft => (
                      <option key={ft} value={ft}>{FORM_TYPE_LABELS[ft]}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={(form[key] as string) ?? (selected[key] as string) ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                )}
              </div>
            ))}
            <button onClick={approve} disabled={saving}
              className="w-full mt-4 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Approve & File'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
