'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Result = {
  id: string
  file_name: string
  life_assured_name: string | null
  nric: string | null
  policy_no: string | null
  status: string
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results ?? [])
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const go = (name: string | null) => {
    if (!name) return
    setQuery('')
    setOpen(false)
    router.push(`/clients/${encodeURIComponent(name)}`)
  }

  const statusColor = (s: string) => {
    if (s === 'filed') return 'text-green-600'
    if (s === 'review') return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search name, NRIC, policy..."
          className="w-56 pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
        {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">...</span>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {results.map(r => (
            <button key={r.id} onClick={() => go(r.life_assured_name)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0">
              <p className="text-sm font-medium text-gray-900">{r.life_assured_name ?? '—'}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {r.nric && <span className="mr-2">NRIC: {r.nric}</span>}
                {r.policy_no && <span className="mr-2">Policy: {r.policy_no}</span>}
                <span className={`font-medium ${statusColor(r.status)}`}>{r.status}</span>
              </p>
              <p className="text-xs text-gray-400 truncate">{r.file_name}</p>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && !loading && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 px-4 py-3 text-xs text-gray-400">
          No results found.
        </div>
      )}
    </div>
  )
}