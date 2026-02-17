"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import apiClient from '@/lib/apiClient';
import type { Transport, ItineraryItem } from '@/lib/apiClient';

export default function TransportPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId as string;
  
  const [transports, setTransports] = useState<Transport[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    id_itit: '',
    type_tran: '',
    provider_tran: '',
    deploc_tran: '',
    arrloc_tran: '',
    deptime_tran: '',
    arrtime_tran: '',
    link_tran: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load itinerary items first
      const items = await apiClient.itinerary.getByTrip(tripId);
      setItineraryItems(items);
      
      // Load all transports for this trip's itinerary items
      const allTransports: Transport[] = [];
      for (const item of items) {
        try {
          const itemTransports = await apiClient.transport.getByItinerary(item.id_itit);
          allTransports.push(...itemTransports);
        } catch (error) {
          // Item might not have transport, continue
        }
      }
      
      setTransports(allTransports);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (tripId) {
      loadData();
    }
  }, [tripId, loadData]);

  function openForm(transport?: Transport) {
    if (transport) {
      setEditingId(transport.id_tran);
      setFormData({
        id_itit: transport.id_itit,
        type_tran: transport.type_tran,
        provider_tran: transport.provider_tran || '',
        deploc_tran: transport.deploc_tran || '',
        arrloc_tran: transport.arrloc_tran || '',
        deptime_tran: transport.deptime_tran || '',
        arrtime_tran: transport.arrtime_tran || '',
        link_tran: transport.link_tran || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        id_itit: itineraryItems[0]?.id_itit || '',
        type_tran: '',
        provider_tran: '',
        deploc_tran: '',
        arrloc_tran: '',
        deptime_tran: '',
        arrtime_tran: '',
        link_tran: '',
      });
    }
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.id_itit || !formData.type_tran) {
      alert('Please fill in required fields');
      return;
    }

    try {
      if (editingId) {
        await apiClient.transport.update(editingId, formData);
      } else {
        await apiClient.transport.create(formData);
      }
      
      closeForm();
      loadData();
    } catch (error) {
      console.error('Failed to save transport:', error);
      alert('Failed to save transport');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this transport?')) return;
    
    try {
      await apiClient.transport.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete transport:', error);
      alert('Failed to delete transport');
    }
  }

  function getTransportIcon(type: string): string {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('flight') || lowerType.includes('plane') || lowerType.includes('air')) return '✈️';
    if (lowerType.includes('train') || lowerType.includes('rail')) return '🚂';
    if (lowerType.includes('bus') || lowerType.includes('coach')) return '🚌';
    if (lowerType.includes('car') || lowerType.includes('drive')) return '🚗';
    if (lowerType.includes('taxi') || lowerType.includes('uber') || lowerType.includes('lyft')) return '🚕';
    if (lowerType.includes('ferry') || lowerType.includes('boat') || lowerType.includes('ship')) return '⛴️';
    if (lowerType.includes('walk') || lowerType.includes('hiking')) return '🚶';
    if (lowerType.includes('bike') || lowerType.includes('bicycle')) return '🚴';
    return '🚗';
  }

  function getDuration(deptime?: string | null, arrtime?: string | null): string | null {
    if (!deptime || !arrtime) return null;
    const start = new Date(deptime);
    const end = new Date(arrtime);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return null;
  }

  function getItineraryName(id_itit: string): string {
    return itineraryItems.find(i => i.id_itit === id_itit)?.title_itit || 'Unknown';
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(`/workspace/${tripId}`)}
                  className="btn-secondary text-sm"
                >
                  ← Back
                </button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <span>🚗</span>
                  <span>Transportation</span>
                </h1>
              </div>
              <button
                onClick={() => openForm()}
                className="btn-primary"
                disabled={itineraryItems.length === 0}
              >
                + Add Transport
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100"></div>
              <p className="mt-2 text-slate-500">Loading transportation...</p>
            </div>
          ) : transports.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-lg font-medium mb-2">No transportation yet</h3>
              <p className="text-slate-500 mb-6">Add flights, trains, buses, or other transport details</p>
              {itineraryItems.length === 0 ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Add itinerary items first to link transportation
                </p>
              ) : (
                <button onClick={() => openForm()} className="btn-primary">
                  + Add First Transport
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {transports.map((transport) => {
                const icon = getTransportIcon(transport.type_tran);
                const duration = getDuration(transport.deptime_tran, transport.arrtime_tran);
                
                return (
                  <div key={transport.id_tran} className="glass-card hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl">{icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{transport.type_tran}</h3>
                            {transport.provider_tran && (
                              <span className="text-sm text-slate-500">
                                · {transport.provider_tran}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            Linked to: {getItineraryName(transport.id_itit)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openForm(transport)}
                          className="btn-secondary text-xs px-2 py-1"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(transport.id_tran)}
                          className="btn-secondary text-xs px-2 py-1 text-red-600"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {(transport.deploc_tran || transport.arrloc_tran) && (
                      <div className="flex items-center gap-4 mb-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 mb-1">From</div>
                          <div className="font-medium">{transport.deploc_tran || '—'}</div>
                          {transport.deptime_tran && (
                            <div className="text-sm text-slate-600 dark:text-slate-300">
                              {new Date(transport.deptime_tran).toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-2xl text-slate-300">→</div>
                        
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 mb-1">To</div>
                          <div className="font-medium">{transport.arrloc_tran || '—'}</div>
                          {transport.arrtime_tran && (
                            <div className="text-sm text-slate-600 dark:text-slate-300">
                              {new Date(transport.arrtime_tran).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {duration && (
                      <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        ⏱️ Duration: {duration}
                      </div>
                    )}

                    {transport.link_tran && (
                      <a
                        href={transport.link_tran}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
                      >
                        🔗 Booking details
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingId ? 'Edit Transportation' : 'Add Transportation'}
                </h2>
                <button onClick={closeForm} className="text-2xl text-slate-400 hover:text-slate-600">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Link to Itinerary Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input w-full"
                    value={formData.id_itit}
                    onChange={(e) => setFormData({ ...formData, id_itit: e.target.value })}
                    required
                  >
                    <option value="">Select itinerary item...</option>
                    {itineraryItems.map((item) => (
                      <option key={item.id_itit} value={item.id_itit}>
                        {item.title_itit} ({item.date_itit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Transport Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input w-full"
                    value={formData.type_tran}
                    onChange={(e) => setFormData({ ...formData, type_tran: e.target.value })}
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="Flight">✈️ Flight</option>
                    <option value="Train">🚂 Train</option>
                    <option value="Bus">🚌 Bus</option>
                    <option value="Car Rental">🚗 Car Rental</option>
                    <option value="Taxi/Rideshare">🚕 Taxi/Rideshare</option>
                    <option value="Ferry">⛴️ Ferry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Provider/Airline/Company</label>
                  <input
                    className="input w-full"
                    value={formData.provider_tran}
                    onChange={(e) => setFormData({ ...formData, provider_tran: e.target.value })}
                    placeholder="United Airlines, Amtrak, Greyhound, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Departure Location</label>
                    <input
                      className="input w-full"
                      value={formData.deploc_tran}
                      onChange={(e) => setFormData({ ...formData, deploc_tran: e.target.value })}
                      placeholder="JFK Airport, NYC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Arrival Location</label>
                    <input
                      className="input w-full"
                      value={formData.arrloc_tran}
                      onChange={(e) => setFormData({ ...formData, arrloc_tran: e.target.value })}
                      placeholder="LAX Airport, LA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Departure Time</label>
                    <input
                      type="datetime-local"
                      className="input w-full"
                      value={formData.deptime_tran}
                      onChange={(e) => setFormData({ ...formData, deptime_tran: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Arrival Time</label>
                    <input
                      type="datetime-local"
                      className="input w-full"
                      value={formData.arrtime_tran}
                      onChange={(e) => setFormData({ ...formData, arrtime_tran: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Booking Link</label>
                  <input
                    type="url"
                    className="input w-full"
                    value={formData.link_tran}
                    onChange={(e) => setFormData({ ...formData, link_tran: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Update' : 'Add'} Transport
                  </button>
                  <button type="button" onClick={closeForm} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
