import Link from "next/link";
import { TripCard } from "../components/TripCard";

export default function HomePage() {
  const trips = [
    { id: "summer-portugal", title: "Summer in Portugal", dates: "July 12 - July 20", members: 3 },
    { id: "alps-weekend", title: "Alps Weekend", dates: "Aug 5 - Aug 8", members: 4 },
    { id: "tokyo-fall", title: "Tokyo in Fall", dates: "Oct 10 - Oct 18", members: 2 },
  ];
  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Section */}
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
            <Link href="/workspace/new" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Start a new trip
            </Link>
            <Link href="/planner" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
              Explore planner
            </Link>
          </div>
        </div>
      </section>

      {/* Trips Section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between px-1 sm:px-0">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Your trips</h2>
          <span className="pill text-[10px] sm:text-xs">
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            3 active
          </span>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map(t => (
            <TripCard key={t.id} id={t.id} title={t.title} dates={t.dates} members={t.members} />
          ))}
        </div>
      </section>
    </div>
  );
}
