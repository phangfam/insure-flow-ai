'use client'
import { useState, useMemo } from 'react'
import { Document, FORM_TYPE_LABELS } from '@/lib/types/document'

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

export default function DocumentTable({ documents }: { documents: Document[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

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

  const statusBadge = (s: string) => {
    if (s === 'filed') return 'bg-green-100 text-green-700'
    if (s === 'review') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="ml-1 text-gray-300">↕</span>
    return <span className="ml-1 text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex gap-3 items-center">
        <input placeholder="Search name, NRIC, policy..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none">
          <option value="all">All status</option>
          <option value="filed">Filed</option>
          <option value="review">Review</option>
          <option value="error">Error</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400 text-sm">No documents yet. Upload one above.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              {COLUMNS.map(col => (
                <th key={col.key}
                  className="px-4 py-2 text-left font-medium cursor-pointer select-none hover:text-gray-800 hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}<SortIcon col={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 max-w-xs truncate font-medium text-gray-900">{doc.file_name}</td>
                <td className="px-4 py-2 text-gray-600">{(FORM_TYPE_LABELS as Record<string, string>)[doc.form_type] ?? doc.form_type}</td>
                <td className="px-4 py-2 text-gray-600">{doc.life_assured_name ?? '-'}</td>
                <td className="px-4 py-2 text-gray-500 font-mono text-xs">{doc.nric ?? '-'}</td>
                <td className="px-4 py-2 text-gray-500 font-mono text-xs">{doc.policy_no ?? '-'}</td>
                <td className="px-4 py-2 text-gray-600">{doc.agent_name ?? '-'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(doc.status)}`}>{doc.status}</span>
                </td>
                <td className="px-4 py-2 text-gray-400 text-xs">{new Date(doc.created_at).toLocaleDateString('en-MY')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}