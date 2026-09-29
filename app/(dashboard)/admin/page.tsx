export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

const ACCENT = '#F45D54'
const DARK = '#111827'

export default async function AdminPage() {
  const supabase = await createClient()

  // Demo mode: load data without auth redirect
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, role, approved, created_at')
    .order('created_at', { ascending: false })

  // Load documents flagged for review (potential duplicates or error)
  const { data: flaggedDocs } = await supabase
    .from('documents')
    .select('id, file_name, life_assured_name, form_type, policy_no, agent_name, status, created_at')
    .or('status.eq.error,status.eq.review')
    .order('created_at', { ascending: false })
    .limit(50)

  // Detect duplicate groups across ALL documents
  const { data: allDocs } = await supabase
    .from('documents')
    .select('id, file_name, life_assured_name, form_type, policy_no, created_at')
    .order('created_at', { ascending: false })

  const dupeGroups: { key: string; ids: { id: string; file_name: string; life_assured_name: string | null; created_at: string }[] }[] = []
  if (allDocs) {
    const seen: Record<string, typeof allDocs> = {}
    for (const doc of allDocs) {
      const key = `${(doc.life_assured_name ?? '').toLowerCase()}|${doc.form_type}|${doc.policy_no ?? ''}`
      if (!seen[key]) seen[key] = []
      seen[key].push(doc)
    }
    for (const [key, docs] of Object.entries(seen)) {
      if (docs.length > 1) dupeGroups.push({ key, ids: docs })
    }
  }

  const total = users?.length ?? 0
  const approved = users?.filter(u => u.approved).length ?? 0
  const pending = total - approved

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: DARK }}>Admin Panel</h1>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>User access management · Duplicate detection · Delete approvals</p>
      </div>

      {/* ── SECTION 1: User Management ── */}
      <section>
        <h2 className="text-base font-bold mb-4" style={{ color: DARK }}>User Access</h2>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Total Users', value: total, bg: '#f9fafb', color: DARK },
            { label: 'Approved', value: approved, bg: '#f0fdf4', color: '#16a34a' },
            { label: 'Pending', value: pending, bg: '#fffbeb', color: '#d97706' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl px-5 py-4" style={{ background: s.bg, border: '1px solid #e5e7eb' }}>
              <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold mt-1 uppercase tracking-wider" style={{ color: '#9ca3af' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* User table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
            <span className="text-sm font-bold" style={{ color: DARK }}>All Users</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['Email', 'Role', 'Status', 'Joined', 'Action'].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users?.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < (users.length - 1) ? '1px solid #f9fafb' : 'none' }}>
                  <td className="px-5 py-3 font-medium" style={{ color: DARK }}>{u.email || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: u.role === 'master' ? '#faf5ff' : u.role === 'admin' ? '#eff6ff' : '#f3f4f6',
                        color: u.role === 'master' ? '#7c3aed' : u.role === 'admin' ? '#2563eb' : '#4b5563',
                      }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: u.approved ? '#f0fdf4' : '#fffbeb',
                        color: u.approved ? '#16a34a' : '#d97706',
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: u.approved ? '#16a34a' : '#d97706' }} />
                      {u.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: '#9ca3af' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <form action="/api/admin/approve" method="POST">
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="approve" value={u.approved ? 'false' : 'true'} />
                      <button type="submit"
                        className="text-xs font-semibold px-3 py-1 rounded-lg transition-opacity hover:opacity-80"
                        style={{
                          background: u.approved ? '#fff5f5' : '#f0fdf4',
                          color: u.approved ? ACCENT : '#16a34a',
                          border: `1px solid ${u.approved ? '#fecaca' : '#bbf7d0'}`,
                        }}>
                        {u.approved ? 'Revoke' : 'Approve'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: '#9ca3af' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECTION 2: Duplicate Records ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: DARK }}>Duplicate Records</h2>
          {dupeGroups.length > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#fff5f5', color: ACCENT, border: `1px solid #fecaca` }}>
              {dupeGroups.length} group{dupeGroups.length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>

        {dupeGroups.length === 0 ? (
          <div className="rounded-2xl px-5 py-10 text-center" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p className="text-sm font-semibold" style={{ color: '#16a34a' }}>✓ No duplicate entries found</p>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>All records have unique form type + policy number combinations per client.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dupeGroups.map(({ key, ids }) => (
              <div key={key} className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: `1px solid #fecaca` }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#fff5f5', borderBottom: '1px solid #fecaca' }}>
                  <div>
                    <span className="text-xs font-bold" style={{ color: ACCENT }}>⚠ Duplicate group</span>
                    <span className="text-xs ml-2" style={{ color: '#9ca3af' }}>{key.replace(/\|/g, ' · ')}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fecaca', color: ACCENT }}>
                    {ids.length} entries
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f9fafb' }}>
                      {['File Name', 'Client', 'Uploaded', 'Action'].map(h => (
                        <th key={h} className="px-4 py-2 text-left" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ids.map((doc, i) => (
                      <tr key={doc.id} style={{ borderBottom: i < ids.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                        <td className="px-4 py-2.5 font-medium max-w-xs truncate" style={{ color: DARK }}>{doc.file_name}</td>
                        <td className="px-4 py-2.5" style={{ color: '#6b7280' }}>{doc.life_assured_name ?? '—'}</td>
                        <td className="px-4 py-2.5 text-xs" style={{ color: '#9ca3af' }}>
                          {new Date(doc.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-2.5">
                          {/* Delete requires human approval — submits to approval queue, does NOT delete immediately */}
                          <form action="/api/admin/request-delete" method="POST" onSubmit={e => {
                            if (!confirm(`Request deletion of "${doc.file_name}"?\n\nThis will be queued for human approval — nothing is deleted immediately.`)) {
                              e.preventDefault()
                            }
                          }}>
                            <input type="hidden" name="docId" value={doc.id} />
                            <button
                              type="submit"
                              className="text-xs font-semibold px-3 py-1 rounded-lg transition-opacity hover:opacity-80"
                              style={{ background: '#fff5f5', color: ACCENT, border: '1px solid #fecaca' }}
                            >
                              Request Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <p className="text-xs px-1" style={{ color: '#9ca3af' }}>
              ℹ️ &quot;Request Delete&quot; queues the record for review. An admin must confirm before any data is permanently removed.
            </p>
          </div>
        )}
      </section>

      {/* ── SECTION 3: Error / Review documents ── */}
      {flaggedDocs && flaggedDocs.length > 0 && (
        <section>
          <h2 className="text-base font-bold mb-4" style={{ color: DARK }}>Flagged Documents</h2>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
              <span className="text-sm font-bold" style={{ color: DARK }}>Status: Error or Review Required</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['File', 'Client', 'Agent', 'Status', 'Uploaded', 'Action'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flaggedDocs.map((doc, i) => (
                  <tr key={doc.id} style={{ borderBottom: i < flaggedDocs.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <td className="px-4 py-2.5 font-medium max-w-xs truncate" style={{ color: DARK }}>{doc.file_name}</td>
                    <td className="px-4 py-2.5" style={{ color: '#6b7280' }}>{doc.life_assured_name ?? '—'}</td>
                    <td className="px-4 py-2.5" style={{ color: '#6b7280' }}>{doc.agent_name ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: doc.status === 'error' ? '#fff5f5' : '#fffbeb', color: doc.status === 'error' ? ACCENT : '#d97706' }}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: '#9ca3af' }}>
                      {new Date(doc.created_at).toLocaleDateString('en-MY')}
                    </td>
                    <td className="px-4 py-2.5">
                      <form action="/api/admin/request-delete" method="POST" onSubmit={e => {
                        if (!confirm(`Request deletion of "${doc.file_name}"?\n\nQueued for admin approval — nothing deleted immediately.`)) {
                          e.preventDefault()
                        }
                      }}>
                        <input type="hidden" name="docId" value={doc.id} />
                        <button type="submit" className="text-xs font-semibold px-3 py-1 rounded-lg hover:opacity-80"
                          style={{ background: '#fff5f5', color: ACCENT, border: '1px solid #fecaca' }}>
                          Request Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
