import MapClient from '../../../components/MapClient'
import { ItineraryBuilder } from '../../../components/ItineraryBuilder'
import { BudgetPanel } from '../../../components/BudgetPanel'
import { DocumentVault } from '../../../components/DocumentVault'
import { ChatBox } from '../../../components/ChatBox'
import { TripHeader } from '../../../components/TripHeader'
import { CommentsPanel } from '../../../components/CommentsPanel'

export default async function WorkspacePage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const participants = ['Alex', 'Jordan', 'Pax']
  const total = 2400
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="space-y-3 sm:space-y-4">
        <TripHeader tripId={tripId} />
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live sync
          </div>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{participants.length} collaborators</span>
        </div>
      </div>
      
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
        <CommentsPanel tripId={tripId} />
      </div>
    </div>
  )
}
