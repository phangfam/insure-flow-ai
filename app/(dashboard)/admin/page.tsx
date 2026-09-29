import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['master', 'admin'].includes(profile.role)) redirect('/')

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, role, approved, created_at')
    .order('created_at', { ascending: false })

  const total = users?.length ?? 0
  const approved = users?.filter(u => u.approved).length ?? 0
  const pending = total - approved

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }}>Team Management</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Approve or revoke staff access to InsureFlow AI</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Users', value: total, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Approved', value: approved, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Pending', value: pending, color: '#d97706', bg: '#fffbeb' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '20px 24px' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>All Users</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Email', 'Role', 'Status', 'Joined', 'Action'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users?.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < (users.length - 1) ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '14px 24px', color: '#111827', fontWeight: '500' }}>{u.email || '—'}</td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                    background: u.role === 'master' ? '#faf5ff' : u.role === 'admin' ? '#eff6ff' : '#f3f4f6',
                    color: u.role === 'master' ? '#7c3aed' : u.role === 'admin' ? '#2563eb' : '#4b5563',
                    textTransform: 'capitalize'
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                    background: u.approved ? '#f0fdf4' : '#fffbeb',
                    color: u.approved ? '#16a34a' : '#d97706'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.approved ? '#16a34a' : '#d97706', display: 'inline-block' }} />
                    {u.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '14px 24px', color: '#9ca3af', fontSize: '13px' }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <form action="/api/admin/approve" method="POST">
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="approve" value={u.approved ? 'false' : 'true'} />
                    <button type="submit" style={{
                      padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer',
                      background: u.approved ? '#fef2f2' : '#f0fdf4',
                      color: u.approved ? '#dc2626' : '#16a34a'
                    }}>
                      {u.approved ? 'Revoke' : 'Approve'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
