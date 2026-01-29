"use client";
import { useState } from 'react'

type Activity = { title: string; date: string; time: string; location: string; costTag?: string; cost?: string }

export function ItineraryBuilder({ onChange }: { onChange?: (items: Activity[]) => void }) {
  const [items, setItems] = useState<Activity[]>([
    { title: 'Brunch', date: 'Jun 7', time: '10:00', location: 'Lisboa', costTag: 'Food', cost: '25.00' },
    { title: 'Castle Tour', date: 'Jun 7', time: '14:00', location: 'Sintra', costTag: 'Attraction', cost: '18.00' },
  ])

  function update(i: number, field: keyof Activity, value: string) {
    const copy = [...items]
    ;(copy[i] as any)[field] = value
    setItems(copy)
    onChange?.(copy)
  }

  function add() {
    const copy = [...items, { title: '', date: '', time: '', location: '', costTag: '', cost: '' }]
    setItems(copy)
    onChange?.(copy)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">The Builder</h3>
        <button className="rounded border px-2 py-1 text-xs" onClick={add}>Add Activity</button>
      </div>
      <div className="grid gap-2">
        {items.map((a, i) => (
          <div key={i} className="rounded border p-3 grid md:grid-cols-5 gap-2">
            <input className="rounded border px-2 py-1" placeholder="Activity Title" value={a.title} onChange={e=>update(i,'title',e.target.value)} />
            <input className="rounded border px-2 py-1" placeholder="Date" value={a.date} onChange={e=>update(i,'date',e.target.value)} />
            <input className="rounded border px-2 py-1" placeholder="Time" value={a.time} onChange={e=>update(i,'time',e.target.value)} />
            <input className="rounded border px-2 py-1" placeholder="Location" value={a.location} onChange={e=>update(i,'location',e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded border px-2 py-1" placeholder="Cost Tag" value={a.costTag || ''} onChange={e=>update(i,'costTag',e.target.value)} />
              <input className="rounded border px-2 py-1" type="number" step="0.01" placeholder="Cost" value={a.cost || ''} onChange={e=>update(i,'cost',e.target.value)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
