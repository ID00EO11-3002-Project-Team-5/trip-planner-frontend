"use client";
import { useEffect, useMemo, useState, useRef } from 'react'
import { apiClient, type ItineraryItem, type DestinationStop } from '@/lib/apiClient'
import { ItineraryTimeline } from './ItineraryTimeline'

type Activity = { 
  id: string; 
  title: string; 
  date: string; 
  time: string; 
  location: string; 
  cost?: number;
  lng?: number; 
  lat?: number;
  stopId?: string;
  isNew?: boolean;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type MapboxFeature = {
  place_name: string;
  center: [number, number];
  text: string;
}

// Template activities for quick insertion
const TEMPLATE_ACTIVITIES = [
  { title: '🍳 Breakfast', time: '08:00', cost: 20 },
  { title: '🏨 Hotel Check-in', time: '15:00', cost: 0 },
  { title: '🏨 Hotel Check-out', time: '11:00', cost: 0 },
  { title: '🍽️ Lunch', time: '12:00', cost: 25 },
  { title: '🍽️ Dinner', time: '19:00', cost: 40 },
  { title: '☕ Coffee Break', time: '10:00', cost: 8 },
  { title: '🚗 Car Rental Pickup', time: '09:00', cost: 0 },
  { title: '🚗 Car Rental Return', time: '17:00', cost: 0 },
  { title: '✈️ Airport Transfer', time: '06:00', cost: 50 },
];

export function ItineraryBuilder({ tripId }: { tripId: string }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [stops, setStops] = useState<DestinationStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState<MapboxFeature[]>([]);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());
  const saveTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isInitialized = useRef(false);

  // Load items and stops from backend
  useEffect(() => {
    if (!tripId || isInitialized.current) return;
    isInitialized.current = true;
    loadItems();
    loadStops();
  }, [tripId]);

  async function loadStops() {
    try {
      const stopsData = await apiClient.stops.getByTrip(tripId);
      setStops(stopsData);
    } catch (error) {
      console.error('Failed to load destination stops:', error);
    }
  }

  async function loadItems() {
    try {
      setLoading(true);
      const itineraryItems = await apiClient.itinerary.getByTrip(tripId);
      
      const activities = itineraryItems.map(item => ({
        id: item.id_itit,
        title: item.title_itit,
        date: item.date_itit,
        time: item.time_itit || '',
        location: item.location_itit || item.formal_location?.name_loca || '',
        cost: item.cost_itit || undefined,
        lng: item.formal_location?.coordinates?.lng,
        lat: item.formal_location?.coordinates?.lat,
        stopId: item.id_loca || undefined,
      }));

      setItems(activities);
      detectConflicts(activities);
    } catch (error) {
      console.error('Failed to load itinerary:', error);
    } finally {
      setLoading(false);
    }
  }

  // Detect overlapping activities (conflicts)
  function detectConflicts(activities: Activity[]) {
    const conflictSet = new Set<string>();
    
    for (let i = 0; i < activities.length; i++) {
      for (let j = i + 1; j < activities.length; j++) {
        const a = activities[i];
        const b = activities[j];
        
        // Only check if same date and both have times
        if (a.date === b.date && a.time && b.time) {
          const timeA = parseTime(a.time);
          const timeB = parseTime(b.time);
          
          // Consider activities conflicting if within 30 minutes of each other
          if (Math.abs(timeA - timeB) < 30) {
            conflictSet.add(a.id);
            conflictSet.add(b.id);
          }
        }
      }
    }
    
    setConflicts(conflictSet);
  }

  // Debounced save for edited items
  async function saveItem(item: Activity) {
    if (!item.title || !item.date) return; // Skip saving incomplete items

    try {
      setSavingItems(prev => new Set(prev).add(item.id));
      
      if (item.isNew) {
        // Calculate position based on current order
        const position = items.findIndex(i => i.id === item.id);
        
        const newItem = await apiClient.itinerary.create({
          id_trip: tripId,
          title_itit: item.title,
          date_itit: item.date,
          time_itit: item.time || undefined,
          location_itit: item.location || undefined,
          cost_itit: item.cost,
          position_itit: position,
          id_loca: item.stopId,
        });

        // Update local state with real ID
        setItems(prev => prev.map(i => i.id === item.id ? {
          ...item,
          id: newItem.id_itit,
          isNew: false,
        } : i));
      } else {
        // Use PATCH endpoint to update existing item
        await apiClient.itinerary.update(item.id, {
          title_itit: item.title,
          date_itit: item.date,
          time_itit: item.time || undefined,
          location_itit: item.location || undefined,
          cost_itit: item.cost,
          id_loca: item.stopId,
        });
      }

    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setSavingItems(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  // Search Mapbox for locations
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
      if (showLocationSearch) {
        searchLocations(locationSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [locationSearch, showLocationSearch])

  // Debounce location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showLocationSearch) {
        searchLocations(locationSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [locationSearch, showLocationSearch]);

  // Create destination stop from Mapbox result
  async function selectLocation(feature: MapboxFeature) {
    try {
      const stop = await apiClient.stops.create({
        id_trip: tripId,
        name_loca: feature.text || feature.place_name,
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1],
        },
      });
    
    // Re-detect conflicts when date or time changes
    if (field === 'date' || field === 'time') {
      detectConflicts(copy);
    }

      // Add as new activity
      const newActivity: Activity = {
        id: `temp-${Date.now()}`,
        title: stop.name_loca,
        date: '',
        time: '',
        location: stop.name_loca,
        lng: stop.coordinates?.lng,
        lat: stop.coordinates?.lat,
        stopId: stop.id_loca,
        isNew: true,
      };

      setItems(prev => [...prev, newActivity]);
      setLocationSearch('');
      setLocationResults([]);
      setShowLocationSearch(false);

      // Dispatch to map
      if (stop.coordinates) {
        try {
          window.dispatchEvent(new CustomEvent('route-set-point', { 
            detail: { type: 'destination', coords: [stop.coordinates.lng, stop.coordinates.lat] } 
          }));
        } catch (_) {}
      }
    } catch (error) {
      console.error('Failed to create destination stop:', error);
    }
  }

  function update(i: number, field: keyof Activity, value: string | number) {
    const item = items[i];
   

  function addTemplate(template: typeof TEMPLATE_ACTIVITIES[0]) {
    const newActivity: Activity = {
      id: `temp-${Date.now()}`,
      title: template.title,
      date: '',  // User needs to set the date
      time: template.time,
      location: '',
      cost: template.cost,
      isNew: true,
    };
    setItems(prev => [...prev, newActivity]);
    setShowTemplates(false);
  } if (!item) return;

    const updated = { ...item, [field]: value };
    const copy = [...items];
    copy[i] = updated;
    setItems(copy);

    // Clear existing timeout
    const existingTimeout = saveTimeouts.current.get(item.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Debounce save (2 seconds after last edit)
    const timeout = setTimeout(() => {
      saveItem(updated);
      saveTimeouts.current.delete(item.id);
    }, 2000);

    saveTimeouts.current.set(item.id, timeout);
  }

  function add() {
    const newActivity: Activity = {
      id: `temp-${Date.now()}`,
      title: '',
      date: '',
      time: '',
      location: '',
      isNew: true,
    };
    setItems(prev => [...prev, newActivity]);
  }

  async function removeItem(item: Activity) {
    try {
      // Cancel any pending save
      const timeout = saveTimeouts.current.get(item.id);
      if (timeout) {
        clearTimeout(timeout);
        saveTimeouts.current.delete(item.id);
      }

      // Delete from backend if it exists
      if (!item.isNew) {
        await apiClient.itinerary.delete(item.id);
      }

      // Remove from local state
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  }

  async function reorderById(fromId: string, toId: string) {
    if (fromId === toId) return;
    const fromIndex = items.findIndex(i => i.id === fromId);
    const toIndex = items.findIndex(i => i.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;

    const copy = [...items];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    setItems(copy);

    // Build updates array with new positions
    const updates = copy
      .filter(item => !item.isNew) // Only reorder saved items
      .map((item, index) => ({
        id_itit: item.id,
        position_itit: index,
      }));

    try {
      if (updates.length > 0) {
        await apiClient.itinerary.reorder(tripId, updates);
      }
    } catch (error) {
      console.error('Failed to reorder items:', error);
      // Revert on error
      await loadItems();
    }
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items.filter(i => {
      const matchSearch = s ? (
        (i.title || '').toLowerCase().includes(s) ||
        (i.location || '').toLowerCase().includes(s)
      ) : true;
      return matchSearch;
    });
  }, [items, search]);

  function parseDate(d: string): number {
    if (!d) return Number.POSITIVE_INFINITY;
    // ISO format
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const t = Date.parse(d);
      return isNaN(t) ? Number.POSITIVE_INFINITY : t;
    }
    // Generic parse
    const t = Date.parse(d);
    return isNaN(t) ? Number.POSITIVE_INFINITY : t;
  }

  function parseTime(t: string): number {
    if (!t) return Number.POSITIVE_INFINITY;
    const m = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return Number.POSITIVE_INFINITY;
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    return h * 60 + min;
  }

  const groups = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    filtered.forEach(i => {
      const key = i.date || 'No date';
      map[key] = map[key] || [];
      map[key].push(i);
    });
    // Sort each group by time, and return sorted entries by date
    const entries = Object.entries(map)
      .map(([k, arr]) => [k, arr.slice().sort((a, b) => parseTime(a.time) - parseTime(b.time))] as [string, Activity[]])
      .sort((a, b) => parseDate(a[0]) - parseDate(b[0]));
    // Rebuild object preserving order
    const ordered: Record<string, Activity[]> = {};
    entries.forEach(([k, arr]) => { ordered[k] = arr; });
    return ordered;
  }, [filtered]);

  function onDragStart(id: string) {
    setActiveId(id);
  }

  function onDropOn(targetId: string) {
    if (activeId) reorderById(activeId, targetId);
    setActiveId(null);
  }

  function onKeyReorder(id: string, dir: 'up' | 'down') {
    const index = items.findIndex(i => i.id === id);
    if (index < 0) return;
    const neighbor = dir === 'up' ? items[index - 1] : items[index + 1];
    if (!neighbor) return;
    reorderById(id, neighbor.id);
  }

  function dispatchRoutePoint(a: Activity, type: 'origin' | 'destination') {
    if (typeof a.lng !== 'number' || typeof a.lat !== 'number') return;
    try {
      window.dispatchEvent(new CustomEvent('route-set-point', { detail: { type, coords: [a.lng, a.lat] } }));
    } catch (_) {}
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Itinerary Builder</h3>
          <div className="text-sm text-slate-500">Loading...</div>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-medium">Itinerary Builder</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input 
            className="input flex-1 sm:w-48" 
            placeholder="Search activities" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
            <button
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setViewMode('timeline')}
            >
              📊 Timeline
            </button>
          </div>
          <>
          <button 
            className="btn-secondary text-xs whitespace-nowrap" 
            onClick={() => setShowLocationSearch(!showLocationSearch)}
          >
            {showLocationSearch ? 'Close Search' : '📍 Search Places'}
          </button>
          <button 
            className="btn-secondary text-xs whitespace-nowrap" 
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? 'Close Templates' : '🎯 Templates'}
          </button>
          <button className="btn-secondary text-xs whitespace-nowrap" onClick={add}>
            + Add Activity
          </button>
        </div>
      </div>

      {/* Template Activities */}
      {showTemplates && (
        <div className="glass-card p-4 space-y-2">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Quick Templates
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEMPLATE_ACTIVITIES.map((template, idx) => (
              <button
                key={idx}
                className="text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors"
                onClick={() => addTemplate(template)}
              >
                <div className="font-medium">{template.title}</div>
                <div className="text-xs text-slate-500">
                  {template.time} • ${template.cost}
                </div>
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 italic mt-2">
            💡 Tip: Templates are added without a date - you'll need to set the date manually
          </div>
        </div>
      )}

      {/* Mapbox Location Search */}
      {showLocationSearch && (
        <div className="glass-card p-4 space-y-2">
          <input
            className="input w-full"
            placeholder="Search for a place (e.g., Eiffel Tower, Central Park)"
            value={locationSearch}
            onChange={e => setLocationSearch(e.target.value)}
            autoFocus
          />
          {locationResults.length > 0 && (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {locationResults.map((feature, idx) => (
                <button
                  key={idx}
          viewMode === 'timeline' ? (
        <ItineraryTimeline 
          activities={filtered.map(a => ({
            id: a.id,
            title: a.title,
            date: a.date,
            time: a.time,
            cost: a.cost,
            duration: 1, // Default 1 hour, could be made configurable
          }))}
        />
      ) :         className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                  onClick={() => selectLocation(feature)}
                >
                  <div className="font-medium">{feature.text}</div>
                  <div className="text-xs text-slate-500">{feature.place_name}</div>
                </button>
              ))}
            </div>
          )}
          {locationSearch && locationResults.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-2">
              {MAPBOX_TOKEN ? 'No results found' : 'Mapbox token not configured'}
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p className="mb-2">No activities yet</p>
          <p className="text-sm">Add activities manually or search for places to visit</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groups).map(([date, arr]) => {
            const total = arr.reduce((sum, a) => sum + ((a.cost) || 0), 0);
            return (
              <div key={date} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{date}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {arr.length} items • ${total.toFixed(2)}
                  </div>
                </div>
                <div className="grid gap-2">
                  {arr.map((a) => {
                    const i = items.findIndex(it => it.id === a.id);
                    const isSaving = savingItems.has(a.id);
                    const hasConflict = conflicts.has(a.id);
                    const isRouteStop = a.title.startsWith('📍 ');
                    const linkedStop = stops.find(s => s.id_loca === a.stopId);
                    
                    return (
                      <div
                        key={a.id}
                        className={`
                          rounded-xl border p-3 space-y-2 relative
                          ${hasConflict 
                            ? 'border-amber-300 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-900/20' 
                            : isRouteStop 
                              ? 'border-blue-300 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-900/20' 
                              : 'border-slate-200/60 bg-white/70 dark:border-slate-700 dark:bg-slate-800/70'
                          }
                        `}
                        draggable
                        onDragStart={() => onDragStart(a.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDropOn(a.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.altKey && e.key === 'ArrowUp') onKeyReorder(a.id, 'up');
                          if (e.altKey && e.key === 'ArrowDown') onKeyReorder(a.id, 'down');
                        }}
                      >
                        {isSaving && (
                          <div className="absolute top-2 right-2 text-xs text-blue-600 dark:text-blue-400">
                            Saving...
                          </div>
                        )}
                        
                        {hasConflict && (
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-200 dark:border-amber-800">
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded">
                              ⚠️ Time Conflict
                            </span>
                            <span className="text-xs text-slate-500">
                              Overlaps with another activity
                            </span>
                          </div>
                        )}
                        
                        {isRouteStop && (
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-200 dark:border-blue-800">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                              🗺️ Route Stop
                            </span>
                            <span className="text-xs text-slate-500">
                              Managed in Destination Stops panel
                            </span>
                          </div>
                        )}
                        
                        {linkedStop && !isRouteStop && (
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-200 dark:border-green-800">
                            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded">
                              🔗 Linked to: {linkedStop.name_loca}
                            </span>
                          </div>
                        )}
                        
                        <div className="grid gap-2 md:grid-cols-2">
                          <input 
                            className="input" 
                            placeholder="Activity Title *" 
                            value={a.title} 
                            onChange={e => update(i, 'title', e.target.value)}
                            disabled={isRouteStop}
                            title={isRouteStop ? "Route stops are managed in the Destination Stops panel" : undefined}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              className="input" 
                              placeholder="Date (YYYY-MM-DD) *" 
                              value={a.date} 
                              onChange={e => update(i, 'date', e.target.value)}
                              disabled={isRouteStop}
                            />
                            <input 
                              className="input" 
                              placeholder="Time (HH:MM)" 
                              value={a.time} 
                              onChange={e => update(i, 'time', e.target.value)}
                              disabled={isRouteStop}
                            />
                          </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                          <div>
                            <select 
                              className="input w-full" 
                              value={a.stopId || ''} 
                              onChange={e => update(i, 'stopId', e.target.value)}
                              disabled={isRouteStop}
                            >
                              <option value="">Select destination stop (optional)</option>
                              {stops.map(stop => (
                                <option key={stop.id_loca} value={stop.id_loca}>
                                  📍 {stop.name_loca}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input 
                            className="input" 
                            type="number" 
                            step="0.01" 
                            placeholder="Cost ($)" 
                            value={a.cost ?? ''} 
                            onChange={e => update(i, 'cost', e.target.value ? parseFloat(e.target.value) : '')}
                            disabled={isRouteStop}
                          />
                        </div>

                        {!linkedStop && !isRouteStop && (
                          <input 
                            className="input" 
                            placeholder="Location (or link to destination stop above)" 
                            value={a.location} 
                            onChange={e => update(i, 'location', e.target.value)}
                          />
                        )}

                        {(a.lng !== undefined && a.lat !== undefined) && (
                          <div className="text-xs text-slate-500">
                            📍 {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          {!isRouteStop && (a.lng !== undefined && a.lat !== undefined) && (
                            <>
                              <button 
                                className="btn-secondary text-xs" 
                                onClick={() => dispatchRoutePoint(a, 'origin')}
                              >
                                Set Origin
                              </button>
                              <button 
                                className="btn-secondary text-xs" 
                                onClick={() => dispatchRoutePoint(a, 'destination')}
                              >
                                Set Destination
                              </button>
                            </>
                          )}
                          {!isRouteStop && (
                            <button 
                              className="btn-secondary text-xs text-red-600 dark:text-red-400 ml-auto" 
                              onClick={() => removeItem(a)}
                            >
                              Delete
                            </button>
                          )}
                          {isRouteStop && (
                            <div className="text-xs text-slate-500 ml-auto italic">
                              Delete in Destination Stops panel
                            </div>
                          )}
                        </div>

                        {a.isNew && (
                          <div className="text-xs text-amber-600 dark:text-amber-400">
                            * Fill in title and date, changes save automatically
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
