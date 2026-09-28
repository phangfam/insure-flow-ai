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

  if (!profile || !['master', 'admin'].includes(profile.role)) {
    redirect('/')
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('id, name, email, role, approved, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Email</th>
            <th className="text-left p-3">Role</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u.id} className="border-t border-gray-100">
              <td className="p-3">{u.name || '—'}</td>
              <td className="p-3">{u.email || '—'}</td>
              <td className="p-3 capitalize">{u.role}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {u.approved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td className="p-3">
                <form action={`/api/admin/approve`} method="POST" className="inline">
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="approve" value={u.approved ? 'false' : 'true'} />
                  <button type="submit" className={`text-xs px-3 py-1 rounded ${u.approved ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {u.approved ? 'Revoke' : 'Approve'}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}