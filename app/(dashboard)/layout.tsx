'use client'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#F3F4F6' }}>
      {/* Top Nav */}
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2937' }} className="px-6 py-0 flex items-center justify-between h-14 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="font-bold text-white tracking-tight flex items-center gap-2 text-sm">
            <span style={{ color: '#F45D54' }}>⬡</span> InsureFlow AI
          </span>
          <div className="flex items-center gap-1">
            {[
              { href: '/dashboard', label: 'Documents' },
              { href: '/review', label: 'Review Queue' },
              { href: '/admin', label: 'Admin' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm px-3 py-1.5 rounded-md transition-colors"
                style={{ color: '#9ca3af' }}
                onMouseOver={e => { (e.target as HTMLElement).style.color = '#fff'; (e.target as HTMLElement).style.background = '#1f2937' }}
                onMouseOut={e => { (e.target as HTMLElement).style.color = '#9ca3af'; (e.target as HTMLElement).style.background = 'transparent' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#F45D54', color: '#fff' }}>Demo</span>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
