'use client'
import { useState, useRef, useEffect } from 'react'

const QA = [
  {
    q: ['upload', 'how do i upload', 'add document', 'new document'],
    a: 'Click the upload area at the top of the dashboard, select your PDF or image file, and InsureFlow AI will automatically extract the form details.',
  },
  {
    q: ['status', 'what is filed', 'what is review', 'what is error', 'filed', 'review', 'error'],
    a: 'Filed = extraction succeeded and data looks complete. Review = low confidence score, needs human check. Error = extraction failed entirely.',
  },
  {
    q: ['export', 'csv', 'download'],
    a: 'Tick the checkboxes on any rows in the document table, then click the blue Export button that appears. It downloads a CSV file.',
  },
  {
    q: ['search', 'find', 'filter'],
    a: 'Use the search bar above the table to search by name, NRIC, or policy number. Use the Status dropdown to filter by Filed, Review, or Error.',
  },
  {
    q: ['client', 'profile', 'life assured'],
    a: 'Click any Life Assured name in the table to open their client profile — showing all their documents, policies, and status summary.',
  },
  {
    q: ['sort', 'column', 'order'],
    a: 'Click any column header to sort the table by that column. Click again to reverse the order.',
  },
  {
    q: ['confidence', 'confidence score'],
    a: 'The confidence score shows how certain the AI is about the extracted data. Low confidence triggers a Review status.',
  },
  {
    q: ['form type', 'nominee', 'surrender', 'death claim', 'medical', 'new policy'],
    a: 'InsureFlow AI detects the form type automatically: Nominee Change, Surrender, Death Claim, Medical, New Policy, PSF06A, or Unknown.',
  },
  {
    q: ['nric', 'policy', 'agent'],
    a: 'NRIC, policy number, and agent name are extracted automatically from the uploaded document by the AI.',
  },
  {
    q: ['hello', 'hi', 'hey'],
    a: 'Hi! Ask me anything about how to use InsureFlow AI.',
  },
]

function getAnswer(input: string): string {
  const q = input.toLowerCase()
  for (const item of QA) {
    if (item.q.some(k => q.includes(k))) return item.a
  }
  return "I'm not sure about that. Try asking about uploading, statuses, exporting, searching, or client profiles."
}

type Message = { role: 'user' | 'bot'; text: string }

export default function HelpChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hi! I can help you use InsureFlow AI. Ask me about uploading, statuses, exporting, or anything else.' }
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const answer = getAnswer(text)
    setMessages(prev => [...prev, { role: 'user', text }, { role: 'bot', text: answer }])
    setInput('')
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors text-2xl"
        aria-label="Help"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-blue-600 px-4 py-3">
            <p className="text-white font-semibold text-sm">InsureFlow Help</p>
            <p className="text-blue-200 text-xs">Ask me how to use the app</p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 max-h-80">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`text-xs rounded-xl px-3 py-2 max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="px-3 py-2 border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask a question..."
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={send} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}