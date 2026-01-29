"use client";
import dynamic from 'next/dynamic'
import { ItineraryBuilder } from '../../../components/ItineraryBuilder'
import { BudgetPanel } from '../../../components/BudgetPanel'
import { DocumentVault } from '../../../components/DocumentVault'
import { ChatBox } from '../../../components/ChatBox'

const Map = dynamic(() => import("../../../components/Map"), { ssr: false });

export default function WorkspacePage({ params }: { params: { tripId: string } }) {
  const participants = ['Alex', 'Jordan', 'Pax']
  const total = 2400
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{params.tripId.replace(/-/g,' ')}</h1>
        <div className="text-sm text-gray-600">Sync status: live</div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <ItineraryBuilder />
          <div className="grid md:grid-cols-2 gap-4">
            <DocumentVault />
            <ChatBox />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded border p-4">
            <div className="font-medium mb-2">Visualizer</div>
            <Map />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <BudgetPanel total={total} participants={participants} />
        <div className="rounded border p-4">
          <div className="font-medium">Action Logic Box</div>
          <div className="text-sm text-gray-600">Jordan needs to pay Alex $300. <button className="ml-2 rounded border px-2 py-1">Mark as paid</button></div>
        </div>
      </div>
    </div>
  )
}
