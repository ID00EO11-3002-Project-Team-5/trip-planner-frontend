"use client";
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from './ToastProvider'

type Item = { name: string; size: number }

export function DocumentVault() {
  const [items, setItems] = useState<Item[]>([])
  const [status, setStatus] = useState<string>("")
  const { show } = useToast()

  const onDrop = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault()
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
      // This is a placeholder; in a real app, keep the File objects and upload them.
      setStatus('Uploaded! (placeholder)')
      show('Uploaded!')
    } catch {
      setStatus('Upload failed')
      show('Upload failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="font-medium">Document Vault</div>
      <div
        onDragOver={(e)=>e.preventDefault()}
        onDrop={onDrop}
        className="rounded-xl border-dashed border-2 border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
      >
        Drag & drop files here
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg border border-slate-200 bg-white/70 p-2 dark:border-slate-700 dark:bg-slate-800/70">Flight Tickets</div>
        <div className="rounded-lg border border-slate-200 bg-white/70 p-2 dark:border-slate-700 dark:bg-slate-800/70">Hotel Confirmations</div>
        <div className="rounded-lg border border-slate-200 bg-white/70 p-2 dark:border-slate-700 dark:bg-slate-800/70">Photos</div>
      </div>
      {!!items.length && (
        <ul className="text-sm text-slate-700 list-disc pl-5">
          {items.map((it, idx) => (
            <li key={idx}>{it.name} • {(it.size/1024).toFixed(1)} KB</li>
          ))}
        </ul>
      )}
      <button className="btn-primary text-sm" onClick={onUpload}>Upload</button>
      {status && <div className="text-xs text-slate-600 dark:text-slate-300">{status}</div>}
    </div>
  )
}
