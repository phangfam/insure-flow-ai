'use client'
import { Document, FORM_TYPE_LABELS } from '@/lib/types/document'

const FORM_TYPE_COLORS: Record<string, string> = {
  NOMINEE:     'bg-blue-50 text-blue-700 border-blue-200',
  SURRENDER:   'bg-orange-50 text-orange-700 border-orange-200',
  DEATH_CLAIM: 'bg-red-50 text-red-700 border-red-200',
  PSF06A:      'bg-purple-50 text-purple-700 border-purple-200',
  MEDICAL:     'bg-teal-50 text-teal-700 border-teal-200',
  NEW_POLICY:  'bg-green-50 text-green-700 border-green-200',
  UNKNOWN:     'bg-gray-50 text-gray-500 border-gray-200',
}

export default function DashboardStats({ documents }: { documents: Document[] }) {
  const total = documents.length
  const filed = documents.filter(d => d.status === 'filed').length
  const review = documents.filter(d => d.status === 'review').length
  const error = documents.filter(d => d.status === 'error').length

  const formCounts: Record<string, number> = {}
  for (const doc of documents) {
    formCounts[doc.form_type] = (formCounts[doc.form_type] ?? 0) + 1
  }
  const formTypes = Object.entries(formCounts)
    .filter(([k]) => k !== 'UNKNOWN')
    .sort((a, b) => b[1] - a[1])

  const today = new Date()
  const days: { label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric' })
    const dateStr = d.toISOString().slice(0, 10)
    const count = documents.filter(doc => doc.created_at.slice(0, 10) === dateStr).length
    days.push({ label, count })
  }
  const maxCount = Math.max(...days.map(d => d.count), 1)

  const statCards = [
    { label: 'Total Documents', value: total, color: 'text-gray-900', bg: 'bg-white', border: 'border-gray-200' },
    { label: 'Filed', value: filed, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Pending Review', value: review, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { label: 'Error', value: error, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} px-5 py-4`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Form Type Breakdown</h3>
          {formTypes.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-2">
              {formTypes.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${FORM_TYPE_COLORS[type] ?? FORM_TYPE_COLORS.UNKNOWN}`}>
                    {(FORM_TYPE_LABELS as Record<string, string>)[type] ?? type}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-4 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Uploads — Last 7 Days</h3>
          <div className="flex items-end gap-2 h-24">
            {days.map(({ label, count }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{count > 0 ? count : ''}</span>
                <div className="w-full flex items-end" style={{ height: '60px' }}>
                  <div className="w-full rounded-t bg-blue-500 transition-all"
                    style={{ height: count === 0 ? '3px' : `${(count / maxCount) * 60}px`, opacity: count === 0 ? 0.2 : 1 }} />
                </div>
                <span className="text-xs text-gray-400 leading-none text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}