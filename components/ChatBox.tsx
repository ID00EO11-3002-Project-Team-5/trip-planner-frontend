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
    <div className="space-y-4">
      <div className="font-medium">Chat</div>
      <div className="h-40 overflow-auto rounded-xl border border-slate-200/60 p-3 text-sm bg-white/70 dark:border-slate-700 dark:bg-slate-800/70">
        {messages.map((m,i)=> (
          <div key={i} className="py-1">{m}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input flex-1" value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" />
        <button className="btn-primary" onClick={send}>Send</button>
      </div>
    </div>
  )
}
