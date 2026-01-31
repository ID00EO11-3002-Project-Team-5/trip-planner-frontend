'use client'
import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '../lib/supabaseClient'
import { Skeleton } from './Skeleton'

export default function Map() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<'none' | 'origin' | 'destination'>('none')
  const [origin, setOrigin] = useState<[number, number] | null>(null)
  const [destination, setDestination] = useState<[number, number] | null>(null)

  useEffect(() => {
    let map: any
    let channel: any
    async function init() {
      const mapboxgl = (await import('mapbox-gl')).default
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
      if (!mapboxgl.accessToken) {
        console.warn('Missing NEXT_PUBLIC_MAPBOX_TOKEN')
      }

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-73.985664, 40.748514],
        zoom: 11
      })
      mapRef.current = map

      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      map.on('click', (e: any) => {
        if (mode === 'origin') {
          setOrigin([e.lngLat.lng, e.lngLat.lat])
        } else if (mode === 'destination') {
          setDestination([e.lngLat.lng, e.lngLat.lat])
        } else {
          new mapboxgl.Marker().setLngLat(e.lngLat).addTo(map)
          try { channel?.send({ type: 'broadcast', event: 'marker-added', payload: e.lngLat }) } catch {}
        }
      })

      // Optional realtime channel
      if (supabase) {
        channel = supabase.channel('trip:demo')
        channel
          .on('broadcast', { event: 'marker-added' }, (payload: any) => {
            try {
              const mapboxgl2 = mapboxgl
              new mapboxgl2.Marker().setLngLat(payload.payload).addTo(map)
            } catch {}
          })
          .subscribe()
      }

      setReady(true)
    }
    init()
    function onRouteSetPoint(ev: any) {
      try {
        const detail = ev.detail as { type: 'origin'|'destination', coords: [number, number] }
        if (!detail || !detail.coords) return
        if (detail.type === 'origin') setOrigin(detail.coords)
        else if (detail.type === 'destination') setDestination(detail.coords)
      } catch {}
    }
    window.addEventListener('route-set-point', onRouteSetPoint as any)
    return () => {
      try { map?.remove?.() } catch {}
      try { channel?.unsubscribe?.() } catch {}
      window.removeEventListener('route-set-point', onRouteSetPoint as any)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !origin || !destination) return
    try { if (map.getLayer('route')) map.removeLayer('route') } catch {}
    try { if (map.getSource('route')) map.removeSource('route') } catch {}
    const geojson = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [origin, destination] },
      properties: {}
    }
    try {
      map.addSource('route', { type: 'geojson', data: geojson })
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#0f172a', 'line-width': 4 }
      })
    } catch {}
  }, [origin, destination])

  function clearRoute() {
    setOrigin(null)
    setDestination(null)
    const map = mapRef.current
    try { if (map.getLayer('route')) map.removeLayer('route') } catch {}
    try { if (map.getSource('route')) map.removeSource('route') } catch {}
  }

  function distKm(a: [number, number], b: [number, number]) {
    const R = 6371
    const dLat = (b[1] - a[1]) * Math.PI / 180
    const dLon = (b[0] - a[0]) * Math.PI / 180
    const lat1 = a[1] * Math.PI / 180
    const lat2 = b[1] * Math.PI / 180
    const sinDLat = Math.sin(dLat/2)
    const sinDLon = Math.sin(dLon/2)
    const h = sinDLat*sinDLat + Math.cos(lat1)*Math.cos(lat2)*sinDLon*sinDLon
    return 2 * R * Math.asin(Math.sqrt(h))
  }

  return (
    <div className="relative h-[400px] w-full rounded-xl overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
        <button className={`btn-secondary text-xs px-3 py-1.5 ${mode==='origin' ? 'ring-2 ring-slate-400' : ''}`} onClick={()=>setMode('origin')}>Set Origin</button>
        <button className={`btn-secondary text-xs px-3 py-1.5 ${mode==='destination' ? 'ring-2 ring-slate-400' : ''}`} onClick={()=>setMode('destination')}>Set Destination</button>
        <button className="btn-secondary text-xs px-3 py-1.5" onClick={()=>setMode('none')}>Done</button>
        <button className="btn-primary text-xs px-3 py-1.5" onClick={clearRoute}>Clear Route</button>
      </div>
      {origin && destination && (
        <div className="absolute bottom-3 left-3 glass-card px-3 py-2 text-sm">
          <div>Distance: {distKm(origin, destination).toFixed(2)} km</div>
        </div>
      )}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto" />
            <div className="text-sm text-slate-500">Loading map...</div>
          </div>
        </div>
      )}
    </div>
  )
}
