"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("../../components/Map"), { ssr: false });

export default function PlannerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Planner</h1>
      <p className="text-gray-600 text-sm">Click on the map to drop markers. Realtime sync is wired via Supabase placeholder and can be enabled later.</p>
      <Map />
    </div>
  );
}
