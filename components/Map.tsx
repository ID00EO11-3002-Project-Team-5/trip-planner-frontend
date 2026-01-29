'use client'
import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '../lib/supabaseClient'

export default function Map() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

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

      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      map.on('click', (e: any) => {
        new mapboxgl.Marker().setLngLat(e.lngLat).addTo(map)
        // Broadcast to realtime channel if configured
        try {
          channel?.send({ type: 'broadcast', event: 'marker-added', payload: e.lngLat })
        } catch {}
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
    return () => {
      try { map?.remove?.() } catch {}
      try { channel?.unsubscribe?.() } catch {}
    }
  }, [])

  return (
    <div className="h-[70vh] w-full rounded-lg border overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />
      {!ready && (
        <div className="p-3 text-sm text-gray-600">Loading map…</div>
      )}
    </div>
  )
}
