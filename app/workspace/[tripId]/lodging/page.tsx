"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import apiClient from '@/lib/apiClient';
import type { Lodging, ItineraryItem } from '@/lib/apiClient';

export default function LodgingPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId as string;
  
  const [lodgings, setLodgings] = useState<Lodging[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    id_itit: '',
    name_lodg: '',
    address_lodg: '',
    checkin_lodg: '',
    checkout_lodg: '',
    confirmation_lodg: '',
    link_lodg: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load itinerary items first
      const items = await apiClient.itinerary.getByTrip(tripId);
      setItineraryItems(items);
      
      // Load all lodgings for this trip's itinerary items
      const allLodgings: Lodging[] = [];
      for (const item of items) {
        try {
          const itemLodgings = await apiClient.lodging.getByItinerary(item.id_itit);
          allLodgings.push(...itemLodgings);
        } catch (error) {
          // Item might not have lodging, continue
        }
      }
      
      setLodgings(allLodgings);
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

  function openForm(lodging?: Lodging) {
    if (lodging) {
      setEditingId(lodging.id_lodg);
      setFormData({
        id_itit: lodging.id_itit,
        name_lodg: lodging.name_lodg,
        address_lodg: lodging.address_lodg || '',
        checkin_lodg: lodging.checkin_lodg || '',
        checkout_lodg: lodging.checkout_lodg || '',
        confirmation_lodg: lodging.confirmation_lodg || '',
        link_lodg: lodging.link_lodg || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        id_itit: itineraryItems[0]?.id_itit || '',
        name_lodg: '',
        address_lodg: '',
        checkin_lodg: '',
        checkout_lodg: '',
        confirmation_lodg: '',
        link_lodg: '',
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
    
    if (!formData.id_itit || !formData.name_lodg) {
      alert('Please fill in required fields');
      return;
    }

    try {
      if (editingId) {
        await apiClient.lodging.update(editingId, formData);
      } else {
        await apiClient.lodging.create(formData);
      }
      
      closeForm();
      loadData();
    } catch (error) {
      console.error('Failed to save lodging:', error);
      alert('Failed to save lodging');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lodging?')) return;
    
    try {
      await apiClient.lodging.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete lodging:', error);
      alert('Failed to delete lodging');
    }
  }

  function getNights(checkin?: string | null, checkout?: string | null): number | null {
    if (!checkin || !checkout) return null;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getItineraryName(id_itit: string): string {
    return itineraryItems.find(i => i.id_itit === id_itit)?.title_itit || 'Unknown';
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
                  <span>🏨</span>
                  <span>Accommodations</span>
                </h1>
              </div>
              <button
                onClick={() => openForm()}
                className="btn-primary"
                disabled={itineraryItems.length === 0}
              >
                + Add Lodging
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100"></div>
              <p className="mt-2 text-slate-500">Loading accommodations...</p>
            </div>
          ) : lodgings.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <div className="text-6xl mb-4">🏨</div>
              <h3 className="text-lg font-medium mb-2">No accommodations yet</h3>
              <p className="text-slate-500 mb-6">Add your hotels, Airbnb, or other lodging details</p>
              {itineraryItems.length === 0 ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Add itinerary items first to link accommodations
                </p>
              ) : (
                <button onClick={() => openForm()} className="btn-primary">
                  + Add First Accommodation
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lodgings.map((lodging) => {
                const nights = getNights(lodging.checkin_lodg, lodging.checkout_lodg);
                return (
                  <div key={lodging.id_lodg} className="glass-card hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{lodging.name_lodg}</h3>
                        <p className="text-xs text-slate-500">
                          Linked to: {getItineraryName(lodging.id_itit)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openForm(lodging)}
                          className="btn-secondary text-xs px-2 py-1"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(lodging.id_lodg)}
                          className="btn-secondary text-xs px-2 py-1 text-red-600"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {lodging.address_lodg && (
                      <div className="flex items-start gap-2 mb-2 text-sm">
                        <span>📍</span>
                        <span className="text-slate-600 dark:text-slate-300">{lodging.address_lodg}</span>
                      </div>
                    )}

                    {(lodging.checkin_lodg || lodging.checkout_lodg) && (
                      <div className="flex items-center gap-4 text-sm mb-2">
                        {lodging.checkin_lodg && (
                          <div>
                            <span className="text-slate-500">Check-in:</span>{' '}
                            <span className="font-medium">{new Date(lodging.checkin_lodg).toLocaleDateString()}</span>
                          </div>
                        )}
                        {lodging.checkout_lodg && (
                          <div>
                            <span className="text-slate-500">Check-out:</span>{' '}
                            <span className="font-medium">{new Date(lodging.checkout_lodg).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {nights && (
                      <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        🌙 {nights} night{nights > 1 ? 's' : ''}
                      </div>
                    )}

                    {lodging.confirmation_lodg && (
                      <div className="text-sm mb-2">
                        <span className="text-slate-500">Confirmation:</span>{' '}
                        <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">
                          {lodging.confirmation_lodg}
                        </code>
                      </div>
                    )}

                    {lodging.link_lodg && (
                      <a
                        href={lodging.link_lodg}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
                      >
                        🔗 Booking link
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
                  {editingId ? 'Edit Accommodation' : 'Add Accommodation'}
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
                    Hotel/Property Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="input w-full"
                    value={formData.name_lodg}
                    onChange={(e) => setFormData({ ...formData, name_lodg: e.target.value })}
                    placeholder="Hilton Garden Inn, Cozy Airbnb, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    className="input w-full"
                    value={formData.address_lodg}
                    onChange={(e) => setFormData({ ...formData, address_lodg: e.target.value })}
                    placeholder="123 Main St, City, Country"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-in Date</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={formData.checkin_lodg}
                      onChange={(e) => setFormData({ ...formData, checkin_lodg: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-out Date</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={formData.checkout_lodg}
                      onChange={(e) => setFormData({ ...formData, checkout_lodg: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Confirmation Number</label>
                  <input
                    className="input w-full"
                    value={formData.confirmation_lodg}
                    onChange={(e) => setFormData({ ...formData, confirmation_lodg: e.target.value })}
                    placeholder="ABC123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Booking Link</label>
                  <input
                    type="url"
                    className="input w-full"
                    value={formData.link_lodg}
                    onChange={(e) => setFormData({ ...formData, link_lodg: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Update' : 'Add'} Accommodation
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
