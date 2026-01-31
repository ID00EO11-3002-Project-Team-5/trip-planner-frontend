"use client";
import { useState } from 'react'

type Message = { sender: string; text: string; isYou?: boolean }

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'Alex', text: 'Landing 3pm!' },
    { sender: 'Jordan', text: 'Dinner at 7?' }
  ])
  const [text, setText] = useState('')
  function send() {
    if (!text.trim()) return
    setMessages(prev => [...prev, { sender: 'You', text: text.trim(), isYou: true }])
    setText('')
  }
  return (
    <div className="flex flex-col h-full min-h-[240px] sm:min-h-[280px]">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="card-title flex items-center gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span className="text-base sm:text-lg">Chat</span>
        </div>
        <span className="text-[10px] sm:text-xs text-slate-400">{messages.length} messages</span>
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-slate-200/60 p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gradient-to-b from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 dark:border-slate-700/60">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.isYou ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${
              m.isYou 
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-br-md' 
                : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-bl-md'
            }`}>
              {!m.isYou && <div className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">{m.sender}</div>}
              <div>{m.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3 sm:mt-4">
        <input 
          className="input flex-1 text-sm" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..." 
        />
        <button className="btn-primary px-3 sm:px-4" onClick={send}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </div>
    </div>
  )
}
