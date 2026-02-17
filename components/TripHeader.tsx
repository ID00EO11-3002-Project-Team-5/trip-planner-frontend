"use client";
import { useState } from "react";
import apiClient from "@/lib/apiClient";
import type { Trip } from "@/lib/apiClient";
import { useToast } from "@/components/ToastProvider";

interface TripHeaderProps {
  tripId: string;
  tripData: Trip | null;
  loading: boolean;
  onUpdate: (trip: Trip) => void;
}

export function TripHeader({ tripId, tripData, loading, onUpdate }: TripHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title_trip: "",
    description_trip: "",
    startdate_trip: "",
    enddate_trip: "",
  });
  const { show } = useToast();

  const handleEdit = () => {
    if (!tripData) return;
    
    // Populate form with current data
    setFormData({
      title_trip: tripData.title_trip,
      description_trip: tripData.description_trip || "",
      startdate_trip: tripData.startdate_trip ? new Date(tripData.startdate_trip).toISOString().split('T')[0] : "",
      enddate_trip: tripData.enddate_trip ? new Date(tripData.enddate_trip).toISOString().split('T')[0] : "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!tripData) return;

    // Validation
    if (!formData.title_trip.trim()) {
      show("Trip title is required");
      return;
    }

    if (formData.startdate_trip && formData.enddate_trip) {
      if (new Date(formData.enddate_trip) < new Date(formData.startdate_trip)) {
        show("End date must be after start date");
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        title_trip: formData.title_trip,
        description_trip: formData.description_trip || undefined,
        startdate_trip: formData.startdate_trip ? new Date(formData.startdate_trip).toISOString() : tripData.startdate_trip,
        enddate_trip: formData.enddate_trip ? new Date(formData.enddate_trip).toISOString() : tripData.enddate_trip,
      };

      const updatedTrip = await apiClient.trips.update(tripId, payload);
      onUpdate(updatedTrip);
      setEditing(false);
      show("Trip updated successfully");
    } catch (error: any) {
      show(error.message || "Failed to update trip");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          </div>
          <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="glass-card p-6">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <p>Trip not found or you don't have access to this trip.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6">
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 break-words">
              {tripData.title_trip}
            </h1>
            {tripData.description_trip && (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {tripData.description_trip}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {formatDate(tripData.startdate_trip)} → {formatDate(tripData.enddate_trip)}
                </span>
              </div>
              {tripData.createdat_trip && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-xs">
                    Created {formatDate(tripData.createdat_trip)}
                  </span>
                </>
              )}
            </div>
          </div>
          <button 
            className="btn-secondary flex-shrink-0 text-sm" 
            onClick={handleEdit}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Trip Title *
              </label>
              <input 
                className="input" 
                value={formData.title_trip} 
                onChange={e => setFormData({ ...formData, title_trip: e.target.value })} 
                placeholder="Summer Adventure in Paris" 
                disabled={saving}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Start Date *
              </label>
              <input 
                type="date" 
                className="input" 
                value={formData.startdate_trip} 
                onChange={e => setFormData({ ...formData, startdate_trip: e.target.value })} 
                disabled={saving}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                End Date *
              </label>
              <input 
                type="date" 
                className="input" 
                value={formData.enddate_trip} 
                onChange={e => setFormData({ ...formData, enddate_trip: e.target.value })} 
                disabled={saving}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea 
                className="input min-h-[80px]" 
                rows={3} 
                value={formData.description_trip} 
                onChange={e => setFormData({ ...formData, description_trip: e.target.value })} 
                placeholder="Tell us about this trip..."
                disabled={saving}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              className="btn-primary text-sm" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 mr-1.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
            <button 
              className="btn-secondary text-sm" 
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
