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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="section-title">{params.tripId.replace(/-/g,' ')}</h1>
        <div className="pill">Sync status: live</div>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <ItineraryBuilder />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <DocumentVault />
            </div>
            <div className="glass-card p-6">
              <ChatBox />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="font-medium mb-3">Visualizer</div>
            <Map />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <BudgetPanel total={total} participants={participants} />
        </div>
        <div className="glass-card p-6 space-y-2">
          <div className="font-medium">Action Logic Box</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Jordan needs to pay Alex $300.
            <button className="ml-2 btn-secondary px-3 py-1">Mark as paid</button>
          </div>
        </div>
      </div>
    </div>
  )
}
