'use client'

interface DeleteRequestButtonProps {
  docId: string
  fileName: string
  confirmMessage: string
}

export default function DeleteRequestButton({ docId, fileName, confirmMessage }: DeleteRequestButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(confirmMessage)) {
      e.preventDefault()
    }
  }

  return (
    <form action="/api/admin/request-delete" method="POST" onSubmit={handleSubmit}>
      <input type="hidden" name="docId" value={docId} />
      <button
        type="submit"
        className="text-xs font-semibold px-3 py-1 rounded-lg transition-opacity hover:opacity-80"
        style={{ background: '#fff5f5', color: '#F45D54', border: '1px solid #fecaca' }}
      >
        Request Delete
      </button>
    </form>
  )
}
