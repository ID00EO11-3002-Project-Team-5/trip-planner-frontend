"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MapClient from '../../../components/MapClient'
import { ItineraryBuilder } from '../../../components/ItineraryBuilder'
import { BudgetPanel } from '../../../components/BudgetPanel'
import { DocumentVault } from '../../../components/DocumentVault'
import { ChatBox } from '../../../components/ChatBox'
import { TripHeader } from '../../../components/TripHeader'
import { CommentsPanel } from '../../../components/CommentsPanel'
import { ProtectedRoute } from '../../../components/ProtectedRoute'
import apiClient from '@/lib/apiClient';
import type { Trip } from '@/lib/apiClient';

export default function WorkspacePage({ params }: { params: { tripId: string } }) {
  const [tripData, setTripData] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Fallback data for other components
  const participants = ['Alex', 'Jordan', 'Pax']
  const total = 2400

  useEffect(() => {
    loadTripData();
  }, [params.tripId]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.trips.getById(params.tripId);
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
          tripId={params.tripId} 
          tripData={tripData} 
          loading={loading}
          onUpdate={handleTripUpdate}
        />
        
        {/* Itinerary - Full Width */}
        <div className="glass-card p-3 sm:p-4 md:p-6">
          <ItineraryBuilder />
        </div>
        
        {/* Map View - Full Width */}
        <div className="glass-card p-2 sm:p-3 md:p-4">
          <div className="card-title flex items-center gap-2 mb-3 sm:mb-4 px-1 sm:px-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            <span className="text-base sm:text-lg">Map View</span>
          </div>
          <MapClient />
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
            <BudgetPanel total={total} participants={participants} />
          </div>
          <CommentsPanel tripId={params.tripId} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
