'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Document, FORM_TYPE_LABELS } from '@/lib/types/document'

const ACCENT = '#F45D54'
const DARK = '#111827'

type SortKey = 'file_name' | 'form_type' | 'life_assured_name' | 'nric' | 'policy_no' | 'agent_name' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

const COLUMNS: { label: string; key: SortKey }[] = [
  { label: 'File', key: 'file_name' },
  { label: 'Form Type', key: 'form_type' },
  { label: 'Life Assured', key: 'life_assured_name' },
  { label: 'NRIC', key: 'nric' },
  { label: 'Policy No', key: 'policy_no' },
  { label: 'Agent', key: 'agent_name' },
  { label: 'Status', key: 'status' },
  { label: 'Uploaded', key: 'created_at' },
]

function exportCSV(docs: Document[]) {
  const headers = ['File', 'Form Type', 'Life Assured', 'NRIC', 'Policy No', 'Agent', 'Status', 'Uploaded']
  const rows = docs.map(d => [
    d.file_name,
    (FORM_TYPE_LABELS as Record<string, string>)[d.form_type] ?? d.form_type,
    d.life_assured_name ?? '',
    d.nric ?? '',
    d.policy_no ?? '',
    d.agent_name ?? '',
    d.status,
    new Date(d.created_at).toLocaleDateString('en-MY'),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `insureflow-export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const statusStyle = (s: string): { bg: string; color: string } => {
  if (s === 'filed')  return { bg: '#f0fdf4', color: '#16a34a' }
  if (s === 'review') return { bg: '#fffbeb', color: '#d97706' }
  return { bg: '#fff5f5', color: ACCENT }
}

export default function DocumentTable({ documents }: { documents: Document[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return documents
      .filter(d => {
        const matchesSearch = !q || [d.file_name, d.life_assured_name, d.nric, d.policy_no, d.agent_name]
          .some(v => v?.toLowerCase().includes(q))
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const av = (a[sortKey] ?? '') as string
        const bv = (b[sortKey] ?? '') as string
        const cmp = av.localeCompare(bv)
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [documents, search, statusFilter, sortKey, sortDir])

  const allChecked = filtered.length > 0 && filtered.every(d => selected.has(d.id))
  const someChecked = filtered.some(d => selected.has(d.id))

  const toggleAll = () => {
    if (allChecked) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(d => n.delete(d.id)); return n })
    } else {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(d => n.add(d.id)); return n })
    }
  }

  const toggleOne = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const selectedDocs = filtered.filter(d => selected.has(d.id))

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="ml-1" style={{ color: '#d1d5db' }}>↕</span>
    return <span className="ml-1" style={{ color: ACCENT }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Toolbar */}
      <div className="px-4 py-3 flex gap-3 items-center" style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
        <input
          placeholder="Search name, NRIC, policy..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2"
          style={{ border: '1px solid #e5e7eb' }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg focus:outline-none"
          style={{ border: '1px solid #e5e7eb', background: '#fff', color: DARK }}
        >
          <option value="all">All status</option>
          <option value="filed">Filed</option>
          <option value="review">Review</option>
          <option value="error">Error</option>
        </select>
        {someChecked && (
          <button
            onClick={() => exportCSV(selectedDocs)}
            className="text-sm px-4 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-90"
            style={{ background: DARK, color: '#fff' }}
          >
            Export {selectedDocs.length}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm" style={{ color: '#9ca3af' }}>No documents found. Upload one above.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                <th className="px-4 py-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked && !allChecked }}
                    onChange={toggleAll}
                    className="cursor-pointer"
                  />
                </th>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-2.5 text-left select-none cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280' }}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}<SortIcon col={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => {
                const s = statusStyle(doc.status)
                const isSelected = selected.has(doc.id)
                return (
                  <tr
                    key={doc.id}
                    style={{
                      background: isSelected ? '#fff5f5' : i % 2 === 0 ? '#fff' : '#fafafa',
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background 0.1s',
                    }}
                    onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                    onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : '#fafafa' }}
                  >
                    <td className="px-4 py-2.5">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(doc.id)} className="cursor-pointer" />
                    </td>
                    <td className="px-4 py-2.5 max-w-xs truncate font-semibold" style={{ color: DARK }}>{doc.file_name}</td>
                    <td className="px-4 py-2.5" style={{ color: '#6b7280' }}>{(FORM_TYPE_LABELS as Record<string, string>)[doc.form_type] ?? doc.form_type}</td>
                    <td className="px-4 py-2.5" style={{ color: '#374151' }}>
                      {doc.life_assured_name
                        ? <Link href={`/clients/${encodeURIComponent(doc.life_assured_name)}`}
                            className="font-semibold hover:underline"
                            style={{ color: ACCENT }}>
                            {doc.life_assured_name}
                          </Link>
                        : <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#9ca3af' }}>{doc.nric ?? '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#9ca3af' }}>{doc.policy_no ?? '—'}</td>
                    <td className="px-4 py-2.5" style={{ color: '#6b7280' }}>{doc.agent_name ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: '#9ca3af' }}>
                      {new Date(doc.created_at).toLocaleDateString('en-MY')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
        <span className="text-xs" style={{ color: '#9ca3af' }}>
          {filtered.length} of {documents.length} record{documents.length !== 1 ? 's' : ''}
        </span>
        {someChecked && (
          <span className="text-xs font-semibold" style={{ color: ACCENT }}>{selectedDocs.length} selected</span>
        )}
      </div>
    </div>
  )
}
