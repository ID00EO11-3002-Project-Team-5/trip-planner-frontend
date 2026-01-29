"use client";
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

type Item = { name: string; size: number }

export function DocumentVault() {
  const [items, setItems] = useState<Item[]>([])
  const [status, setStatus] = useState<string>("")

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
        return
      }
      // This is a placeholder; in a real app, keep the File objects and upload them.
      setStatus('Uploaded! (placeholder)')
    } catch {
      setStatus('Upload failed')
    }
  }

  return (
    <div className="rounded border p-4 space-y-3">
      <div className="font-medium">Document Vault</div>
      <div
        onDragOver={(e)=>e.preventDefault()}
        onDrop={onDrop}
        className="rounded border-dashed border-2 p-6 text-center text-sm text-gray-600"
      >
        Drag & drop files here
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded border p-2">Flight Tickets</div>
        <div className="rounded border p-2">Hotel Confirmations</div>
        <div className="rounded border p-2">Photos</div>
      </div>
      {!!items.length && (
        <ul className="text-sm text-gray-700 list-disc pl-5">
          {items.map((it, idx) => (
            <li key={idx}>{it.name} • {(it.size/1024).toFixed(1)} KB</li>
          ))}
        </ul>
      )}
      <button className="rounded border px-3 py-2 text-sm" onClick={onUpload}>Upload</button>
      {status && <div className="text-xs text-gray-600">{status}</div>}
    </div>
  )
}
