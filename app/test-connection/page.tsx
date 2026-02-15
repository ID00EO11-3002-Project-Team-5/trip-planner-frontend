"use client";

import { useState, useEffect } from 'react';
import api from '../../lib/apiClient';

export default function ConnectionTestPage() {
  const [status, setStatus] = useState<string>('Checking...');
  const [trips, setTrips] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Test backend connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const health = await api.health.check();
      setStatus(health.status);
    } catch (err: any) {
      setStatus('Disconnected');
      setError(err.message);
    }
  };

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.trips.getAll();
      setTrips(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTestTrip = async () => {
    setLoading(true);
    setError('');
    try {
      const newTrip = await api.trips.create({
        name: 'Test Trip',
        description: 'Created from connection test',
        destination: 'Test Destination',
        start_date: new Date().toISOString(),
      });
      setTrips([...trips, newTrip]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="section-title">Backend Connection Test</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Test the connection between frontend and backend
        </p>
      </div>

      {/* Connection Status */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg mb-4">Connection Status</h2>
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${
              status === 'Backend is running' 
                ? 'bg-emerald-500' 
                : 'bg-red-500'
            }`}
          />
          <span className="font-medium">{status}</span>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        <button 
          onClick={testConnection}
          className="mt-4 btn-secondary"
          disabled={loading}
        >
          Retest Connection
        </button>
      </div>

      {/* API Testing */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg mb-4">API Tests</h2>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <button 
              onClick={fetchTrips}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch Trips'}
            </button>
            <button 
              onClick={createTestTrip}
              className="btn-secondary"
              disabled={loading}
            >
              Create Test Trip
            </button>
          </div>

          {/* Trips List */}
          {trips.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Trips ({trips.length})</h3>
              <div className="space-y-2">
                {trips.map((trip) => (
                  <div 
                    key={trip.id} 
                    className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="font-medium">{trip.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {trip.description}
                    </div>
                    {trip.destination && (
                      <div className="text-sm text-slate-500 mt-1">
                        📍 {trip.destination}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Info */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-lg mb-4">Configuration</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Backend URL:</span>
            <span className="font-mono">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Supabase URL:</span>
            <span className="font-mono text-xs">
              {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
