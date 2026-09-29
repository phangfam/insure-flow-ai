'use client'
import { Document, FORM_TYPE_LABELS } from '@/lib/types/document'

const ACCENT = '#F45D54'
const DARK = '#111827'

const FORM_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  NOMINEE:     { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  SURRENDER:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  DEATH_CLAIM: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  PSF06A:      { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
  MEDICAL:     { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
  NEW_POLICY:  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  UNKNOWN:     { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
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
    { label: 'Total Documents', value: total, valueColor: DARK, bg: '#fff', accent: '#e5e7eb', icon: '📄' },
    { label: 'Filed', value: filed, valueColor: '#16a34a', bg: '#f0fdf4', accent: '#bbf7d0', icon: '✅' },
    { label: 'Pending Review', value: review, valueColor: '#d97706', bg: '#fffbeb', accent: '#fde68a', icon: '🕐' },
    { label: 'Error', value: error, valueColor: ACCENT, bg: '#fff5f5', accent: '#fecaca', icon: '⚠️' },
  ]

  return (
    <div className="space-y-5">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label}
            className="rounded-2xl px-5 py-5 relative overflow-hidden"
            style={{ background: s.bg, border: `1px solid ${s.accent}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <div className="absolute top-3 right-4 text-2xl opacity-20">{s.icon}</div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9ca3af' }}>{s.label}</p>
            <p className="text-4xl font-black mt-1 tracking-tight" style={{ color: s.valueColor }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form type breakdown */}
        <div className="rounded-2xl px-5 py-5" style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: DARK }}>Form Type Breakdown</h3>
          {formTypes.length === 0 ? (
            <p className="text-sm" style={{ color: '#9ca3af' }}>No data yet</p>
          ) : (
            <div className="space-y-2.5">
              {formTypes.map(([type, count]) => {
                const palette = FORM_TYPE_COLORS[type] ?? FORM_TYPE_COLORS.UNKNOWN
                return (
                  <div key={type} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                      style={{ background: palette.bg, color: palette.text, border: `1px solid ${palette.border}` }}>
                      {(FORM_TYPE_LABELS as Record<string, string>)[type] ?? type}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 rounded-full h-1.5" style={{ background: '#f3f4f6' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${(count / total) * 100}%`, background: ACCENT }} />
                      </div>
                      <span className="text-sm font-bold w-4 text-right" style={{ color: DARK }}>{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 7-day chart */}
        <div className="rounded-2xl px-5 py-5" style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: DARK }}>Uploads — Last 7 Days</h3>
          <div className="flex items-end gap-2 h-24">
            {days.map(({ label, count }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold" style={{ color: ACCENT, minHeight: '16px' }}>{count > 0 ? count : ''}</span>
                <div className="w-full flex items-end" style={{ height: '60px' }}>
                  <div className="w-full rounded-t transition-all"
                    style={{
                      height: count === 0 ? '3px' : `${(count / maxCount) * 60}px`,
                      background: count === 0 ? '#f3f4f6' : ACCENT,
                      opacity: count === 0 ? 0.4 : 1,
                    }} />
                </div>
                <span className="text-xs text-center leading-tight" style={{ color: '#9ca3af', fontSize: '10px' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
