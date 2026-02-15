"use client";
import { useEffect, useMemo, useState } from 'react'

type Activity = { id: string; title: string; date: string; time: string; location: string; costTag?: string; cost?: string; lng?: number; lat?: number }

const defaultItems: Activity[] = [
  { id: 'a1', title: 'Brunch', date: 'Jun 7', time: '10:00', location: 'Lisboa', costTag: 'Food', cost: '25.00' },
  { id: 'a2', title: 'Castle Tour', date: 'Jun 7', time: '14:00', location: 'Sintra', costTag: 'Attraction', cost: '18.00' },
];

export function ItineraryBuilder({ onChange }: { onChange?: (items: Activity[]) => void }) {
  const [items, setItems] = useState<Activity[]>(defaultItems);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('itinerary_items');
      const storedSearch = localStorage.getItem('itinerary_search');
      const storedTag = localStorage.getItem('itinerary_tag');
      if (storedItems) setItems(JSON.parse(storedItems));
      if (storedSearch) setSearch(storedSearch);
      if (storedTag) setTagFilter(storedTag);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('itinerary_items', JSON.stringify(items)) } catch {}
  }, [items])
  useEffect(() => {
    try { localStorage.setItem('itinerary_search', search) } catch {}
  }, [search])
  useEffect(() => {
    try { localStorage.setItem('itinerary_tag', tagFilter) } catch {}
  }, [tagFilter])

  function update(i: number, field: keyof Activity, value: string) {
    const copy = [...items]
    ;(copy[i] as any)[field] = value
    setItems(copy)
    onChange?.(copy)
  }

  function add() {
    const copy = [...items, { id: `a${Date.now()}`, title: '', date: '', time: '', location: '', costTag: '', cost: '' }]
    setItems(copy)
    onChange?.(copy)
  }

  function reorderById(fromId: string, toId: string) {
    if (fromId === toId) return
    const fromIndex = items.findIndex(i => i.id === fromId)
    const toIndex = items.findIndex(i => i.id === toId)
    if (fromIndex < 0 || toIndex < 0) return
    const copy = [...items]
    const [moved] = copy.splice(fromIndex, 1)
    copy.splice(toIndex, 0, moved)
    setItems(copy)
    onChange?.(copy)
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return items.filter(i => {
      const matchTag = tagFilter ? (i.costTag || '').toLowerCase() === tagFilter.toLowerCase() : true
      const matchSearch = s ? (
        (i.title || '').toLowerCase().includes(s) ||
        (i.location || '').toLowerCase().includes(s)
      ) : true
      return matchTag && matchSearch
    })
  }, [items, search, tagFilter])

  const tags = useMemo(() => {
    const set = new Set<string>()
    items.forEach(i => { if (i.costTag) set.add(i.costTag) })
    return Array.from(set)
  }, [items])

  function parseDate(d: string): number {
    if (!d) return Number.POSITIVE_INFINITY
    // Try ISO first
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const t = Date.parse(d)
      return isNaN(t) ? Number.POSITIVE_INFINITY : t
    }
    // Try generic Date parse (supports 'Jun 7', '7 Jun')
    const t = Date.parse(d)
    return isNaN(t) ? Number.POSITIVE_INFINITY : t
  }

  function parseTime(t: string): number {
    if (!t) return Number.POSITIVE_INFINITY
    // Supports HH:MM
    const m = t.match(/^(\d{1,2}):(\d{2})$/)
    if (!m) return Number.POSITIVE_INFINITY
    const h = parseInt(m[1], 10)
    const min = parseInt(m[2], 10)
    return h * 60 + min
  }

  const groups = useMemo(() => {
    const map: Record<string, Activity[]> = {}
    filtered.forEach(i => {
      const key = i.date || 'No date'
      map[key] = map[key] || []
      map[key].push(i)
    })
    // sort each group by time, and return sorted entries by date
    const entries = Object.entries(map)
      .map(([k, arr]) => [k, arr.slice().sort((a,b)=> parseTime(a.time) - parseTime(b.time))] as [string, Activity[]])
      .sort((a,b)=> parseDate(a[0]) - parseDate(b[0]))
    // rebuild object preserving order
    const ordered: Record<string, Activity[]> = {}
    entries.forEach(([k, arr])=> { ordered[k] = arr })
    return ordered
  }, [filtered])
  function dispatchRoutePoint(a: Activity, type: 'origin' | 'destination') {
    if (typeof a.lng !== 'number' || typeof a.lat !== 'number') return
    try {
      window.dispatchEvent(new CustomEvent('route-set-point', { detail: { type, coords: [a.lng, a.lat] } }))
    } catch {}
  }

  function onDragStart(id: string) {
    setActiveId(id)
  }

  function onDropOn(targetId: string) {
    if (activeId) reorderById(activeId, targetId)
    setActiveId(null)
  }

  function onKeyReorder(id: string, dir: 'up' | 'down') {
    const index = items.findIndex(i => i.id === id)
    if (index < 0) return
    const neighbor = dir === 'up' ? items[index - 1] : items[index + 1]
    if (!neighbor) return
    reorderById(id, neighbor.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-medium">The Builder</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex gap-2">
            <input className="input flex-1 sm:w-36 lg:w-48" placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} />
            <select className="input flex-1 sm:w-28 lg:w-36" value={tagFilter} onChange={e=>setTagFilter(e.target.value)}>
              <option value="">All tags</option>
              {tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn-secondary text-xs whitespace-nowrap" onClick={add}>Add Activity</button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groups).map(([date, arr]) => {
          const total = arr.reduce((sum, a) => sum + (parseFloat(a.cost || '0') || 0), 0)
          return (
            <div key={date} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{date}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{arr.length} items • ${total.toFixed(2)}</div>
              </div>
              <div className="grid gap-2">
                {arr.map((a) => {
                  const i = items.findIndex(it => it.id === a.id)
                  return (
                    <div
                      key={a.id}
                      className="rounded-xl border border-slate-200/60 bg-white/70 p-3 space-y-2 md:space-y-0 md:grid md:grid-cols-5 md:gap-2 dark:border-slate-700 dark:bg-slate-800/70"
                      draggable
                      onDragStart={() => onDragStart(a.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDropOn(a.id)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.altKey && e.key === 'ArrowUp') onKeyReorder(a.id, 'up')
                        if (e.altKey && e.key === 'ArrowDown') onKeyReorder(a.id, 'down')
                      }}
                    >
                      <input className="input" placeholder="Activity Title" value={a.title} onChange={e=>update(i,'title',e.target.value)} />
                      <div className="grid grid-cols-2 gap-2 md:contents">
                        <input className="input" placeholder="Date" value={a.date} onChange={e=>update(i,'date',e.target.value)} />
                        <input className="input" placeholder="Time" value={a.time} onChange={e=>update(i,'time',e.target.value)} />
                      </div>
                      <input className="input" placeholder="Location" value={a.location} onChange={e=>update(i,'location',e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <input className="input" placeholder="Cost Tag" value={a.costTag || ''} onChange={e=>update(i,'costTag',e.target.value)} />
                        <input className="input" type="number" step="0.01" placeholder="Cost" value={a.cost || ''} onChange={e=>update(i,'cost',e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 md:col-span-5">
                        <input className="input" type="number" step="0.0001" placeholder="Lng" value={a.lng ?? ''} onChange={e=>update(i,'lng',e.target.value)} />
                        <input className="input" type="number" step="0.0001" placeholder="Lat" value={a.lat ?? ''} onChange={e=>update(i,'lat',e.target.value)} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:col-span-5">
                        <button className="btn-secondary text-xs flex-1 sm:flex-none" onClick={()=>dispatchRoutePoint(a,'origin')}>Use as Origin</button>
                        <button className="btn-secondary text-xs flex-1 sm:flex-none" onClick={()=>dispatchRoutePoint(a,'destination')}>Use as Destination</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
