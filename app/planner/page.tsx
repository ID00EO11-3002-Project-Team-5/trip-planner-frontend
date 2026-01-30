"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("../../components/Map"), { ssr: false });

export default function PlannerPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="section-title">Planner</h1>
        <p className="text-slate-600 text-sm dark:text-slate-300">Click the map to drop markers. Realtime sync can be enabled later via Supabase.</p>
      </div>
      <div className="glass-card p-4">
        <Map />
      </div>
    </div>
  );
}
