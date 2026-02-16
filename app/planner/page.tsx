"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import apiClient from "@/lib/apiClient";
import type { Trip } from "@/lib/apiClient";

const Map = dynamic(() => import("../../components/Map"), { ssr: false });

export default function PlannerPage() {
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentTrips();
  }, []);

  const loadRecentTrips = async () => {
    try {
      const data = await apiClient.trips.getAll();
      // Show max 3 most recent trips
      setRecentTrips(data.slice(0, 3));
    } catch (error) {
      console.error("Failed to load trips:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="section-title">Planner</h1>
            <p className="text-slate-600 text-sm dark:text-slate-300">
              Plan your trips and visualize destinations on the map
            </p>
          </div>
          <Link href="/trips" className="btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Trip
          </Link>
        </div>

        {/* Recent Trips */}
        {!loading && recentTrips.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Trips</h2>
              <Link href="/trips" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                View all →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {recentTrips.map((trip) => (
                <Link
                  key={trip.id_trip}
                  href={`/workspace/${trip.id_trip}`}
                  className="glass-card p-4 hover:shadow-xl transition-shadow group"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white">
                    {trip.title_trip}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">
                      {new Date(trip.startdate_trip).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h2 className="font-semibold text-lg">Interactive Map</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Click the map to drop markers and plan your route. Premium features coming soon!
          </p>
          <Map />
        </div>
      </div>
    </ProtectedRoute>
  );
}
