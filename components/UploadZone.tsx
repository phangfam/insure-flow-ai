'use client'
import { useState, useRef } from 'react'

interface UploadResult {
  file: string
  status: 'filed' | 'review' | 'error'
  message?: string
}

export default function UploadZone() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<UploadResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter(f =>
      ['pdf', 'jpg', 'jpeg', 'png'].includes(f.name.split('.').pop()?.toLowerCase() ?? '')
    )
    if (!arr.length) return
    setUploading(true)
    setResults([])

    const newResults: UploadResult[] = []
    for (const file of arr) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/documents/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) {
          newResults.push({ file: file.name, status: 'error', message: json.error ?? 'Upload failed' })
        } else {
          newResults.push({ file: file.name, status: json.status })
        }
      } catch (e) {
        newResults.push({ file: file.name, status: 'error', message: String(e) })
      }
    }
    setResults(newResults)
    setUploading(false)
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-sm text-gray-600">Extracting with Claude...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-700">Drop insurance forms here or click to browse</p>
            <p className="text-xs text-gray-400">PDF, JPG, PNG</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
        onChange={e => e.target.files && uploadFiles(e.target.files)} />

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm ${r.status === 'filed' ? 'bg-green-50 text-green-800' : r.status === 'review' ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'}`}>
              <span className="font-medium">{r.file}</span>
              <span>-</span>
              <span>{r.status === 'filed' ? 'Filed' : r.status === 'review' ? 'Needs review' : `Error: ${r.message}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
