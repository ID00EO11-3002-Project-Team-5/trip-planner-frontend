"use client";

import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { useEffect, useState } from "react";
import { tripsApi, Trip } from "@/lib/apiClient";
import { TripCard } from "../components/TripCard";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      setLoadingTrips(true);
      tripsApi.getAll()
        .then(data => {
          setTrips(data.slice(0, 3)); // Show only 3 recent trips
        })
        .catch(err => {
          console.error('Failed to load trips:', err);
        })
        .finally(() => {
          setLoadingTrips(false);
        });
    }
  }, [user, loading]);

  return (
    <div className="space-y-8 md:space-y-12">{
      /* Hero Section */}
      <section className="relative py-8 sm:py-12 md:py-16 text-center">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-60 w-60 sm:h-80 sm:w-80 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-60 blur-3xl dark:from-blue-900/30 dark:to-purple-900/30" />
          <div className="absolute -bottom-40 -left-40 h-60 w-60 sm:h-80 sm:w-80 rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 opacity-60 blur-3xl dark:from-emerald-900/30 dark:to-cyan-900/30" />
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
            Collaborative planning
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 px-2">
            Plan better trips<br />with friends
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed px-4">
            Organize itineraries, split expenses, and share documents — all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-4 sm:px-0">
            {user ? (
              <>
                <Link href="/trips" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Start a new trip
                </Link>
                <Link href="/planner" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
                  Open planner
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
                  Get started free
                </Link>
                <Link href="/login" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Trips Section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between px-1 sm:px-0">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
            {user ? "Your recent trips" : "Features"}
          </h2>
          {user && trips.length > 0 && (
            <Link href="/trips" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all
            </Link>
          )}
        </div>

        {user ? (
          // Show user's trips when logged in
          loadingTrips ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : trips.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map(t => (
                <Link key={t.id_trip} href={`/workspace/${t.id_trip}`}>
                  <div className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {t.title_trip}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(t.startdate_trip).toLocaleDateString()} - {new Date(t.enddate_trip).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">No trips yet. Start planning your first adventure!</p>
              <Link href="/trips" className="btn-primary inline-block">
                Create your first trip
              </Link>
            </div>
          )
        ) : (
          // Show features when not logged in
          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
            <div className="glass-card p-6 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Smart Itineraries</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Plan day-by-day activities with an intuitive drag-and-drop interface.</p>
            </div>
            
            <div className="glass-card p-6 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Expense Tracking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Split bills and track group expenses automatically with fair settlements.</p>
            </div>
            
            <div className="glass-card p-6 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Collaborate</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Invite friends, share documents, and plan together in real-time.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
