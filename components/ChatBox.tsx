"use client";
import { useState } from 'react'

export function ChatBox() {
  const [messages, setMessages] = useState<string[]>([
    'Alex: Landing 3pm!',
    'Jordan: Dinner at 7?'
  ])
  const [text, setText] = useState('')
  function send() {
    if (!text.trim()) return
    setMessages(prev => [...prev, `You: ${text}`])
    setText('')
  }
  return (
    <div className="rounded border p-4 space-y-3">
      <div className="font-medium">Chat</div>
      <div className="h-40 overflow-auto rounded border p-2 text-sm bg-gray-50">
        {messages.map((m,i)=> (
          <div key={i} className="py-1">{m}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 rounded border px-2 py-1" value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" />
        <button className="rounded border px-3 py-1 text-sm" onClick={send}>Send</button>
      </div>
    </div>
  )
}
