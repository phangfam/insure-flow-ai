'use client'

const ACCENT = '#F45D54'

interface Props {
  signedUrl: string | null
  isPdf: boolean
  fileName: string
}

export default function DocumentViewer({ signedUrl, isPdf, fileName }: Props) {
  if (!signedUrl) {
    return (
      <div className="rounded-2xl flex items-center justify-center h-96" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
        <p className="text-sm" style={{ color: '#9ca3af' }}>File not available</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      {isPdf ? (
        <iframe
          src={signedUrl}
          className="w-full"
          style={{ height: '75vh', border: 'none' }}
          title={fileName}
        />
      ) : (
        <img
          src={signedUrl}
          alt={fileName}
          className="w-full object-contain"
          style={{ maxHeight: '75vh', background: '#f9fafb' }}
        />
      )}
      <div className="px-4 py-2.5 flex justify-end" style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80"
          style={{ background: ACCENT, color: '#fff' }}
        >
          Open in new tab ↗
        </a>
      </div>
    </div>
  )
}
