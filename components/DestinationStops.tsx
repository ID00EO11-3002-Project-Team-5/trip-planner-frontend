"use client";
import { useEffect, useState, useCallback } from 'react';
import { apiClient, type ItineraryItem } from '@/lib/apiClient';
import { calculateDistance, estimateTravelTime, formatDistance, formatTravelTime } from '@/lib/geoUtils';

interface DestinationStopsProps {
  tripId: string;
  onStopSelected?: (stop: RouteStop) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const ROUTE_STOP_PREFIX = '📍 ';

type MapboxFeature = {
  place_name: string;
  center: [number, number];
  text: string;
};

type RouteStop = {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number } | null;
  position: number;
};

export function DestinationStops({ tripId, onStopSelected }: DestinationStopsProps) {
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [allItems, setAllItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState<MapboxFeature[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const loadStops = useCallback(async () => {
    try {
      setLoading(true);
      const items = await apiClient.itinerary.getByTrip(tripId);
      setAllItems(items);
      
      // Filter route stops (items with 📍 prefix) and convert to RouteStop format
      const routeStops: RouteStop[] = items
        .filter(item => item.title_itit.startsWith(ROUTE_STOP_PREFIX))
        .sort((a, b) => a.position_itit - b.position_itit)
        .map(item => {
          let coordinates: { lat: number; lng: number } | null = null;
          if (item.location_itit) {
            try {
              coordinates = JSON.parse(item.location_itit);
            } catch (e) {
              console.warn('Failed to parse coordinates:', item.location_itit);
            }
          }
          
          return {
            id: item.id_itit,
            name: item.title_itit.replace(ROUTE_STOP_PREFIX, ''),
            coordinates,
            position: item.position_itit,
          };
        });
      
      setStops(routeStops);
      
      // Dispatch event to update map routes (convert to old format for compatibility)
      try {
        const stopsForMap = routeStops.map(s => ({
          id_loca: s.id,
          coordinates: s.coordinates
        }));
        window.dispatchEvent(new CustomEvent('destinations-updated', { 
          detail: { stops: stopsForMap } 
        }));
      } catch (_) {}
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
      // Get the next position (after all existing items)
      const maxPosition = Math.max(0, ...allItems.map(i => i.position_itit));
      const nextPosition = maxPosition + 1;
      
      const coordinates = {
        lat: feature.center[1],
        lng: feature.center[0],
      };
      
      const newItem = await apiClient.itinerary.create({
        id_trip: tripId,
        title_itit: ROUTE_STOP_PREFIX + (feature.text || feature.place_name),
        date_itit: new Date().toISOString().split('T')[0], // Today's date
        location_itit: JSON.stringify(coordinates),
        position_itit: nextPosition,
        id_loca: null,
      });

      const newStop: RouteStop = {
        id: newItem.id_itit,
        name: newItem.title_itit.replace(ROUTE_STOP_PREFIX, ''),
        coordinates,
        position: newItem.position_itit,
      };

      setStops(prev => [...prev, newStop]);
      setAllItems(prev => [...prev, newItem]);
      setLocationSearch('');
      setLocationResults([]);
      setShowSearch(false);

      // Dispatch map event to show marker (use old field names for compatibility)
      try {
        window.dispatchEvent(new CustomEvent('destination-added', { 
          detail: { 
            stop: { id_loca: newStop.id, name_loca: newStop.name },
            coords: [coordinates.lng, coordinates.lat] 
          } 
        }));
      } catch (_) {}
      
      // Update the full stops list for route drawing (convert to old format)
      const updatedStops = [...stops, newStop].map(s => ({
        id_loca: s.id,
        coordinates: s.coordinates
      }));
      try {
        window.dispatchEvent(new CustomEvent('destinations-updated', { 
          detail: { stops: updatedStops } 
        }));
      } catch (_) {}
    } catch (error) {
      console.error('Failed to create destination stop:', error);
    }
  }

  async function deleteStop(stopId: string) {
    try {
      await apiClient.itinerary.delete(stopId);
      setStops(prev => prev.filter(s => s.id !== stopId));
      setAllItems(prev => prev.filter(i => i.id_itit !== stopId));

      // Dispatch map event to remove marker
      try {
        window.dispatchEvent(new CustomEvent('destination-removed', { 
          detail: { stopId } 
        }));
      } catch (_) {}
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

    const draggedIndex = stops.findIndex(s => s.id === draggedId);
    const targetIndex = stops.findIndex(s => s.id === targetId);

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedId(null);
      return;
    }

    // Reorder locally
    const newStops = [...stops];
    const [movedStop] = newStops.splice(draggedIndex, 1);
    newStops.splice(targetIndex, 0, movedStop);

    // Update positions for all route stops only
    const updates = newStops.map((stop, index) => ({
      id_itit: stop.id,
      position_itit: stop.position + (index - stops.findIndex(s => s.id === stop.id)),
    }));

    setStops(newStops);
    setDraggedId(null);

    // Dispatch event to update map routes with new order (convert to old format)
    try {
      const stopsForMap = newStops.map(s => ({
        id_loca: s.id,
        coordinates: s.coordinates
      }));
      window.dispatchEvent(new CustomEvent('destinations-updated', { 
        detail: { stops: stopsForMap } 
      }));
    } catch (_) {}

    // Save to backend using itinerary reorder
    try {
      await apiClient.itinerary.reorder(tripId, updates);
      // Reload to get updated positions
      loadStops();
    } catch (error) {
      console.error('Failed to reorder stops:', error);
      // Reload on error
      loadStops();
    }
  }

  function showOnMap(stop: RouteStop) {
    if (stop.coordinates) {
      try {
        window.dispatchEvent(new CustomEvent('map-focus', { 
          detail: { 
            coords: [stop.coordinates.lng, stop.coordinates.lat],
            zoom: 14 
          } 
        }));
      } catch (_) {}
    }
    onStopSelected?.(stop);
  }

  function getLinkedActivities(stopId: string): ItineraryItem[] {
    // Find activities that are NOT route stops and don't have id_loca set
    // (we'll use proximity or manual linking in the future)
    return allItems.filter(item => 
      !item.title_itit.startsWith(ROUTE_STOP_PREFIX) && 
      item.id_loca === stopId
    );
  }

  function calculateStopDistance(index: number): { distance: number; travelTime: { hours: number; minutes: number; totalMinutes: number } } | null {
    if (index === 0 || !stops[index].coordinates || !stops[index - 1].coordinates) {
      return null;
    }
    
    const current = stops[index].coordinates!;
    const previous = stops[index - 1].coordinates!;
    
    const distance = calculateDistance(
      previous.lat,
      previous.lng,
      current.lat,
      current.lng
    );
    
    const travelTime = estimateTravelTime(distance, 'driving');
    
    return { distance, travelTime };
  }

  function exportToGPX() {
    const stopsWithCoords = stops.filter(s => s.coordinates);
    if (stopsWithCoords.length === 0) {
      alert('No stops with coordinates to export');
      return;
    }

    const waypoints = stopsWithCoords
      .map((stop, i) => `
    <wpt lat="${stop.coordinates!.lat}" lon="${stop.coordinates!.lng}">
      <name>${stop.name}</name>
      <desc>Stop ${i + 1}</desc>
    </wpt>`)
      .join('');

    const trackPoints = stopsWithCoords
      .map(stop => `
        <trkpt lat="${stop.coordinates!.lat}" lon="${stop.coordinates!.lng}">
          <name>${stop.name}</name>
        </trkpt>`)
      .join('');

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Trip Planner" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Trip Route</name>
    <desc>Destination stops route</desc>
  </metadata>${waypoints}
  <trk>
    <name>Route</name>
    <trkseg>${trackPoints}
    </trkseg>
  </trk>
</gpx>`;

    downloadFile(gpx, 'trip-route.gpx', 'application/gpx+xml');
  }

  function exportToKML() {
    const stopsWithCoords = stops.filter(s => s.coordinates);
    if (stopsWithCoords.length === 0) {
      alert('No stops with coordinates to export');
      return;
    }

    const placemarks = stopsWithCoords
      .map((stop, i) => `
    <Placemark>
      <name>${stop.name}</name>
      <description>Stop ${i + 1}</description>
      <Point>
        <coordinates>${stop.coordinates!.lng},${stop.coordinates!.lat},0</coordinates>
      </Point>
    </Placemark>`)
      .join('');

    const lineCoordinates = stopsWithCoords
      .map(stop => `${stop.coordinates!.lng},${stop.coordinates!.lat},0`)
      .join(' ');

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Trip Route</name>
    <description>Destination stops route</description>${placemarks}
    <Placemark>
      <name>Route</name>
      <LineString>
        <coordinates>${lineCoordinates}</coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

    downloadFile(kml, 'trip-route.kml', 'application/vnd.google-earth.kml+xml');
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        <div className="flex gap-1">
          {stops.length > 0 && (
            <div className="relative group">
              <button className="btn-secondary text-xs px-2 py-1">
                ⬇️
              </button>
              <div className="absolute right-0 mt-1 hidden group-hover:block bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700 py-1 z-10 min-w-[120px]">
                <button
                  onClick={exportToGPX}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Export GPX
                </button>
                <button
                  onClick={exportToKML}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Export KML
                </button>
              </div>
            </div>
          )}
          <button 
            className="btn-secondary text-xs"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? 'Close' : '📍 Add Stop'}
          </button>
        </div>
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
          {stops.map((stop, index) => {
            const distanceInfo = calculateStopDistance(index);
            const linkedItems = getLinkedActivities(stop.id);
            
            return (
              <div key={stop.id}>
                {/* Distance indicator between stops */}
                {distanceInfo && (
                  <div className="flex items-center gap-2 py-1 px-2 text-xs text-slate-500">
                    <div className="flex-1 border-t border-dashed border-slate-300 dark:border-slate-600"></div>
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                      <span>🚗 {formatDistance(distanceInfo.distance)}</span>
                      <span>⏱️ {formatTravelTime(distanceInfo.travelTime.hours, distanceInfo.travelTime.minutes)}</span>
                    </div>
                    <div className="flex-1 border-t border-dashed border-slate-300 dark:border-slate-600"></div>
                  </div>
                )}
                
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, stop.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stop.id)}
                  className={`
                    rounded-lg border border-slate-200/60 bg-white/70 p-3 
                    dark:border-slate-700 dark:bg-slate-800/70
                    cursor-move hover:border-slate-300 dark:hover:border-slate-600
                    transition-all
                    ${draggedId === stop.id ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          #{index + 1}
                        </span>
                        <h4 className="font-medium text-sm truncate">{stop.name}</h4>
                      </div>
                      {stop.coordinates && (
                        <p className="text-xs text-slate-500 mt-1">
                          📍 {stop.coordinates.lat.toFixed(4)}, {stop.coordinates.lng.toFixed(4)}
                        </p>
                      )}
                      {linkedItems.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 mb-1">📅 Linked activities:</p>
                          <div className="space-y-1">
                            {linkedItems.map(item => (
                              <div key={item.id_itit} className="text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                {item.title_itit} {item.date_itit && `• ${item.date_itit}`}
                              </div>
                            ))}
                          </div>
                        </div>
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
                        onClick={() => deleteStop(stop.id)}
                        title="Delete stop"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {stops.length > 0 && (
        <>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            💡 Drag stops to reorder your route
          </div>
          
          {stops.length > 1 && stops.every(s => s.coordinates) && (
            <div className="glass-card p-3">
              <div className="text-xs font-medium mb-2">Route Summary</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1.5 rounded">
                  <div className="text-slate-500">Total Distance</div>
                  <div className="font-medium">
                    {formatDistance(
                      stops.reduce((total, stop, index) => {
                        const info = calculateStopDistance(index);
                        return total + (info?.distance || 0);
                      }, 0)
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1.5 rounded">
                  <div className="text-slate-500">Est. Drive Time</div>
                  <div className="font-medium">
                    {(() => {
                      const totalMinutes = stops.reduce((total, stop, index) => {
                        const info = calculateStopDistance(index);
                        return total + (info?.travelTime.totalMinutes || 0);
                      }, 0);
                      const hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;
                      return formatTravelTime(hours, minutes);
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
