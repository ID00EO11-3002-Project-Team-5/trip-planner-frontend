"use client";
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from './ToastProvider'

type Item = { name: string; size: number }

const categories = [
  { name: 'Flight Tickets', icon: '✈️', color: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700' },
  { name: 'Hotels', icon: '🏨', color: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700' },
  { name: 'Photos', icon: '📸', color: 'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-700' },
]

export function DocumentVault() {
  const [items, setItems] = useState<Item[]>([])
  const [status, setStatus] = useState<string>("")
  const [dragOver, setDragOver] = useState(false)
  const { show } = useToast()

  const onDrop = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault()
    setDragOver(false)
    const files = Array.from(ev.dataTransfer.files || [])
    setItems(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size }))])
  }, [])

  const onUpload = async () => {
    setStatus('Uploading…')
    try {
      if (!supabase) {
        setStatus('Supabase not configured. Files staged locally only.')
        show('Supabase not configured')
        return
      }
      setStatus('Uploaded! (placeholder)')
      show('Uploaded!')
    } catch {
      setStatus('Upload failed')
      show('Upload failed')
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <div className="card-title flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
          Document Vault
        </div>
        <span className="text-xs text-slate-400">{items.length} files</span>
      </div>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex-1 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          dragOver 
            ? 'border-slate-400 bg-slate-100/80 dark:border-slate-500 dark:bg-slate-700/80 scale-[1.02]' 
            : 'border-slate-300 bg-gradient-to-b from-slate-50/50 to-white/50 dark:border-slate-600 dark:from-slate-800/50 dark:to-slate-900/50'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Drag & drop files here</div>
          <div className="text-xs text-slate-400 dark:text-slate-500">or click to browse</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4">
        {categories.map(c => (
          <div key={c.name} className={`rounded-xl border bg-gradient-to-br ${c.color} p-3 text-center`}>
            <div className="text-lg mb-1">{c.icon}</div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">{c.name}</div>
          </div>
        ))}
      </div>
      
      {!!items.length && (
        <ul className="mt-4 space-y-2">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium text-slate-700 dark:text-slate-300">{it.name}</div>
                <div className="text-xs text-slate-400">{(it.size/1024).toFixed(1)} KB</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <button className="btn-primary w-full mt-4" onClick={onUpload}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        Upload
      </button>
      {status && <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">{status}</div>}
    </div>
  )
}
