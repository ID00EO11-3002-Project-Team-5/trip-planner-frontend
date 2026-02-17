"use client";
import { useEffect, useState, useCallback } from 'react';
import { apiClient, type DestinationStop } from '@/lib/apiClient';

interface DestinationStopsProps {
  tripId: string;
  onStopSelected?: (stop: DestinationStop) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type MapboxFeature = {
  place_name: string;
  center: [number, number];
  text: string;
};

export function DestinationStops({ tripId, onStopSelected }: DestinationStopsProps) {
  const [stops, setStops] = useState<DestinationStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState<MapboxFeature[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const loadStops = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.stops.getByTrip(tripId);
      setStops(data);
      
      // Dispatch event to update map routes
      try {
        window.dispatchEvent(new CustomEvent('destinations-updated', { 
          detail: { stops: data } 
        }));
      } catch {}
    } catch (error) {
      console.error('Failed to load destination stops:', error);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (tripId) {
      loadStops();
    }
  }, [tripId, loadStops]);

  // Mapbox location search
  async function searchLocations(query: string) {
    if (!query.trim() || !MAPBOX_TOKEN) {
      setLocationResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
      );
      const data = await response.json();
      setLocationResults(data.features || []);
    } catch (error) {
      console.error('Mapbox search failed:', error);
      setLocationResults([]);
    }
  }

  // Debounce location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSearch) {
        searchLocations(locationSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [locationSearch, showSearch]);

  async function addStop(feature: MapboxFeature) {
    try {
      const newStop = await apiClient.stops.create({
        id_trip: tripId,
        name_loca: feature.text || feature.place_name,
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1],
        },
      });

      setStops(prev => [...prev, newStop]);
      setLocationSearch('');
      setLocationResults([]);
      setShowSearch(false);

      // Dispatch map event to show marker
      if (newStop.coordinates) {
        try {
          window.dispatchEvent(new CustomEvent('destination-added', { 
            detail: { 
              stop: newStop,
              coords: [newStop.coordinates.lng, newStop.coordinates.lat] 
            } 
          }));
        } catch {}
      }
      
      // Update the full stops list for route drawing
      const updatedStops = [...stops, newStop];
      try {
        window.dispatchEvent(new CustomEvent('destinations-updated', { 
          detail: { stops: updatedStops } 
        }));
      } catch {}
    } catch (error) {
      console.error('Failed to create destination stop:', error);
    }
  }

  async function deleteStop(stopId: string) {
    try {
      await apiClient.stops.delete(stopId);
      setStops(prev => prev.filter(s => s.id_loca !== stopId));

      // Dispatch map event to remove marker
      try {
        window.dispatchEvent(new CustomEvent('destination-removed', { 
          detail: { stopId } 
        }));
      } catch {}
    } catch (error) {
      console.error('Failed to delete stop:', error);
    }
  }

  // Drag and drop handlers
  function handleDragStart(e: React.DragEvent, stopId: string) {
    setDraggedId(stopId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = stops.findIndex(s => s.id_loca === draggedId);
    const targetIndex = stops.findIndex(s => s.id_loca === targetId);

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedId(null);
      return;
    }

    // Reorder locally
    const newStops = [...stops];
    const [movedStop] = newStops.splice(draggedIndex, 1);
    newStops.splice(targetIndex, 0, movedStop);

    // Update positions
    const updates = newStops.map((stop, index) => ({
      id_loca: stop.id_loca,
      position_loca: index,
    }));

    setStops(newStops);
    setDraggedId(null);

    // Dispatch event to update map routes with new order
    try {
      window.dispatchEvent(new CustomEvent('destinations-updated', { 
        detail: { stops: newStops } 
      }));
    } catch {}

    // Save to backend
    try {
      await apiClient.stops.reorder(updates);
    } catch (error) {
      console.error('Failed to reorder stops:', error);
      // Reload on error
      loadStops();
    }
  }

  function showOnMap(stop: DestinationStop) {
    if (stop.coordinates) {
      try {
        window.dispatchEvent(new CustomEvent('map-focus', { 
          detail: { 
            coords: [stop.coordinates.lng, stop.coordinates.lat],
            zoom: 14 
          } 
        }));
      } catch {}
    }
    onStopSelected?.(stop);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Destination Stops</h3>
          <div className="text-sm text-slate-500">Loading...</div>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Destination Stops</h3>
        <button 
          className="btn-secondary text-xs"
          onClick={() => setShowSearch(!showSearch)}
        >
          {showSearch ? 'Close' : '📍 Add Stop'}
        </button>
      </div>

      {/* Mapbox Search */}
      {showSearch && (
        <div className="glass-card p-3 space-y-2">
          <input
            className="input w-full text-sm"
            placeholder="Search for a destination..."
            value={locationSearch}
            onChange={e => setLocationSearch(e.target.value)}
            autoFocus
          />
          {locationResults.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {locationResults.map((feature, idx) => (
                <button
                  key={idx}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-xs"
                  onClick={() => addStop(feature)}
                >
                  <div className="font-medium">{feature.text}</div>
                  <div className="text-xs text-slate-500">{feature.place_name}</div>
                </button>
              ))}
            </div>
          )}
          {locationSearch && locationResults.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-2">
              {MAPBOX_TOKEN ? 'No results found' : 'Mapbox token not configured'}
            </div>
          )}
        </div>
      )}

      {/* Stops List */}
      {stops.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-sm">
          <p className="mb-1">No destination stops yet</p>
          <p className="text-xs">Search for places to add to your trip</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stops.map((stop, index) => (
            <div
              key={stop.id_loca}
              draggable
              onDragStart={(e) => handleDragStart(e, stop.id_loca)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stop.id_loca)}
              className={`
                rounded-lg border border-slate-200/60 bg-white/70 p-3 
                dark:border-slate-700 dark:bg-slate-800/70
                cursor-move hover:border-slate-300 dark:hover:border-slate-600
                transition-all
                ${draggedId === stop.id_loca ? 'opacity-50' : ''}
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      #{index + 1}
                    </span>
                    <h4 className="font-medium text-sm truncate">{stop.name_loca}</h4>
                  </div>
                  {stop.coordinates && (
                    <p className="text-xs text-slate-500 mt-1">
                      📍 {stop.coordinates.lat.toFixed(4)}, {stop.coordinates.lng.toFixed(4)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {stop.coordinates && (
                    <button
                      className="btn-secondary text-xs px-2 py-1"
                      onClick={() => showOnMap(stop)}
                      title="Show on map"
                    >
                      🗺️
                    </button>
                  )}
                  <button
                    className="btn-secondary text-xs px-2 py-1 text-red-600 dark:text-red-400"
                    onClick={() => deleteStop(stop.id_loca)}
                    title="Delete stop"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-slate-500 dark:text-slate-400">
        💡 Drag stops to reorder your route
      </div>
    </div>
  );
}
