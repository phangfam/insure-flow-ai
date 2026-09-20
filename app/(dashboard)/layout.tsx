import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-900">InsureFlow AI</span>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Documents</Link>
          <Link href="/review" className="text-sm text-gray-600 hover:text-gray-900">Review Queue</Link>
        </div>
        <span className="text-xs text-gray-400">{user.email}</span>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
