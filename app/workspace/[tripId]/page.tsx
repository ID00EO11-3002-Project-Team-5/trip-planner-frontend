"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MapClient from '../../../components/MapClient'
import { ItineraryBuilder } from '../../../components/ItineraryBuilder'
import { BudgetPanel } from '../../../components/BudgetPanel'
import { DocumentVault } from '../../../components/DocumentVault'
import { ChatBox } from '../../../components/ChatBox'
import { TripHeader } from '../../../components/TripHeader'
import { CommentsPanel } from '../../../components/CommentsPanel'
import { DestinationStops } from '../../../components/DestinationStops'
import { ProtectedRoute } from '../../../components/ProtectedRoute'
import apiClient from '@/lib/apiClient';
import type { Trip } from '@/lib/apiClient';

export default function WorkspacePage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const [tripData, setTripData] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (tripId) {
      loadTripData();
    }
  }, [tripId]);

  const loadTripData = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      const data = await apiClient.trips.getById(tripId);
      setTripData(data);
    } catch (error) {
      console.error('Error loading trip:', error);
      // Optionally redirect to trips page if trip not found
      // router.push('/trips');
    } finally {
      setLoading(false);
    }
  };

  const handleTripUpdate = (updatedTrip: Trip) => {
    setTripData(updatedTrip);
  };
  
  return (
    <ProtectedRoute>
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header Section */}
        <TripHeader 
          tripId={tripId} 
          tripData={tripData} 
          loading={loading}
          onUpdate={handleTripUpdate}
        />
        
        {/* Itinerary - Full Width */}
        <div className="glass-card p-3 sm:p-4 md:p-6">
          <ItineraryBuilder tripId={tripId} />
        </div>

        {/* Quick Access Links */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <button
            onClick={() => router.push(`/workspace/${tripId}/lodging`)}
            className="glass-card p-4 sm:p-6 hover:shadow-xl transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">🏨</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Accommodations</h3>
                <p className="text-sm text-slate-500">Manage hotels, Airbnb, and lodging</p>
              </div>
              <div className="ml-auto text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                →
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push(`/workspace/${tripId}/transport`)}
            className="glass-card p-4 sm:p-6 hover:shadow-xl transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">🚗</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Transportation</h3>
                <p className="text-sm text-slate-500">Flights, trains, buses, and more</p>
              </div>
              <div className="ml-auto text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                →
              </div>
            </div>
          </button>
        </div>
        
        {/* Map and Destination Stops */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {/* Destination Stops - Side Panel */}
          <div className="glass-card p-3 sm:p-4 md:p-6 md:col-span-1">
            <DestinationStops tripId={tripId} />
          </div>
          
          {/* Map View */}
          <div className="glass-card p-2 sm:p-3 md:p-4 md:col-span-2">
            <div className="card-title flex items-center gap-2 mb-3 sm:mb-4 px-1 sm:px-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              <span className="text-base sm:text-lg">Map View</span>
            </div>
            <MapClient />
          </div>
        </div>
        
        {/* Secondary Content Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="glass-card p-3 sm:p-4 md:p-6">
            <DocumentVault />
          </div>
          <div className="glass-card p-3 sm:p-4 md:p-6">
            <ChatBox />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="glass-card p-3 sm:p-4 md:p-6">
            <BudgetPanel tripId={tripId} />
          </div>
          <CommentsPanel tripId={tripId} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
