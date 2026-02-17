"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import apiClient from "@/lib/apiClient";
import type { Trip } from "@/lib/apiClient";
import { useToast } from "@/components/ToastProvider";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const router = useRouter();
  const { show } = useToast();

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await apiClient.trips.getAll();
      setTrips(data);
    } catch (error: any) {
      show(error.message || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      await apiClient.trips.delete(tripId);
      show("Trip deleted successfully");
      loadTrips();
    } catch (error: any) {
      show(error.message || "Failed to delete trip");
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="section-title">My Trips</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage and view all your trips
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTrip(null);
              setShowCreateModal(true);
            }}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Trip
          </button>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="font-semibold text-lg mb-2">No trips yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create your first trip to start planning
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div key={trip.id_trip} className="glass-card p-6 hover:shadow-xl transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                      {trip.title_trip}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingTrip(trip);
                          setShowCreateModal(true);
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        title="Edit trip"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(trip.id_trip)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded"
                        title="Delete trip"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {trip.description_trip && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {trip.description_trip}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {new Date(trip.startdate_trip).toLocaleDateString()} - {new Date(trip.enddate_trip).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/workspace/${trip.id_trip}`)}
                    className="w-full btn-secondary text-sm"
                  >
                    Open Workspace
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <TripFormModal
            trip={editingTrip}
            onClose={() => {
              setShowCreateModal(false);
              setEditingTrip(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setEditingTrip(null);
              loadTrips();
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function TripFormModal({
  trip,
  onClose,
  onSuccess,
}: {
  trip: Trip | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(trip?.title_trip || "");
  const [description, setDescription] = useState(trip?.description_trip || "");
  const [startDate, setStartDate] = useState(
    trip?.startdate_trip ? new Date(trip.startdate_trip).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    trip?.enddate_trip ? new Date(trip.enddate_trip).toISOString().split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(endDate) < new Date(startDate)) {
      show("End date must be after start date");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title_trip: title,
        description_trip: description || undefined,
        startdate_trip: new Date(startDate).toISOString(),
        enddate_trip: new Date(endDate).toISOString(),
      };

      if (trip) {
        await apiClient.trips.update(trip.id_trip, payload);
        show("Trip updated successfully");
      } else {
        await apiClient.trips.create(payload);
        show("Trip created successfully");
      }

      onSuccess();
    } catch (error: any) {
      show(error.message || `Failed to ${trip ? "update" : "create"} trip`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {trip ? "Edit Trip" : "Create New Trip"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trip Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Summer Adventure in Paris"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[80px]"
              placeholder="A brief description of your trip..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Saving..." : trip ? "Update Trip" : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
