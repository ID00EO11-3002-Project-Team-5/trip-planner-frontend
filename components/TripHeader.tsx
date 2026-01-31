"use client";
import { useEffect, useState } from "react";
import { getJSON, setJSON } from "../lib/localStore";

type TripMeta = {
  title: string;
  description?: string;
  startDate?: string; // ISO YYYY-MM-DD
  endDate?: string;   // ISO YYYY-MM-DD
};

export function TripHeader({ tripId }: { tripId: string }) {
  const safeId = tripId ?? "";
  const storageKey = `trip:${safeId}:meta`;
  const [meta, setMeta] = useState<TripMeta>(() => getJSON(storageKey, {
    title: (safeId ? safeId.replace(/-/g, " ") : "Trip"),
    description: "",
    startDate: "",
    endDate: "",
  }));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setJSON(storageKey, meta);
  }, [meta, storageKey]);

  const formatDate = (d: string) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return d; }
  };

  return (
    <div className="glass-card p-6">
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 capitalize">
              {meta.title || (safeId ? safeId.replace(/-/g, " ") : "Trip")}
            </h1>
            {meta.description && (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{meta.description}</p>
            )}
            {(meta.startDate || meta.endDate) && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {formatDate(meta.startDate || '') || '?'} → {formatDate(meta.endDate || '') || '?'}
              </div>
            )}
          </div>
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
              <input className="input mt-1.5" value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} placeholder="Trip name" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date Range</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <input type="date" className="input" value={meta.startDate} onChange={e => setMeta({ ...meta, startDate: e.target.value })} />
                <input type="date" className="input" value={meta.endDate} onChange={e => setMeta({ ...meta, endDate: e.target.value })} />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea className="input mt-1.5" rows={3} value={meta.description || ""} onChange={e => setMeta({ ...meta, description: e.target.value })} placeholder="What's this trip about?" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button className="btn-primary" onClick={() => setEditing(false)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Save
            </button>
            <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
