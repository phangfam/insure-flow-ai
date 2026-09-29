'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ACCENT = '#F45D54'
const DARK = '#111827'

const FORM_TYPES = [
  'Surrender', 'Medical', 'PSF06A', 'Nominee Change',
  'Death Claim', 'Discharge Voucher', 'Unknown',
]

interface Doc {
  id: string
  file_name: string
  life_assured_name: string | null
  nric: string | null
  policy_no: string | null
  agent_name: string | null
  form_type: string
  status: string
}

export default function DocumentEditForm({ doc }: { doc: Doc }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    life_assured_name: doc.life_assured_name ?? '',
    nric: doc.nric ?? '',
    policy_no: doc.policy_no ?? '',
    agent_name: doc.agent_name ?? '',
    form_type: doc.form_type ?? 'Unknown',
    status: doc.status ?? 'review',
  })

  const field = (label: string, key: keyof typeof form, type: 'text' | 'select' = 'text', options?: string[]) => (
    <div key={key}>
      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9ca3af' }}>{label}</label>
      {type === 'select' ? (
        <select
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl text-sm font-medium outline-none"
          style={{ border: '1px solid #e5e7eb', color: DARK, background: '#fff' }}
        >
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl text-sm font-medium outline-none"
          style={{ border: '1px solid #e5e7eb', color: DARK, background: '#fff' }}
        />
      )}
    </div>
  )

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="rounded-2xl p-6 space-y-5" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
      {field('Life Assured Name', 'life_assured_name')}
      {field('NRIC', 'nric')}
      {field('Policy No', 'policy_no')}
      {field('Agent Name', 'agent_name')}
      {field('Form Type', 'form_type', 'select', FORM_TYPES)}
      {field('Status', 'status', 'select', ['review', 'filed', 'error'])}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: ACCENT, color: '#fff' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>✓ Saved</span>}
      </div>
    </div>
  )
}
