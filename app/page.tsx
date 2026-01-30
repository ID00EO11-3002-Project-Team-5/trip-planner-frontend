import Link from "next/link";
import { TripCard } from "../components/TripCard";

export default function HomePage() {
  const trips = [
    { id: "summer-portugal", title: "Summer in Portugal", dates: "July 12 - July 20", members: 3 },
    { id: "alps-weekend", title: "Alps Weekend", dates: "Aug 5 - Aug 8", members: 4 },
    { id: "tokyo-fall", title: "Tokyo in Fall", dates: "Oct 10 - Oct 18", members: 2 },
  ];
  return (
    <div className="space-y-8">
      <section className="text-center space-y-3">
        <h1 className="section-title bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300">
          Plan better trips with friends
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Start a new trip or continue planning an existing one.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/workspace/new" className="btn-primary">Start a new trip</Link>
          <Link href="/planner" className="btn-secondary">Explore planner</Link>
        </div>
        <div className="mt-2"><span className="pill">Shared status: online</span></div>
      </section>

      <section className="space-y-4">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-100">Your trips</div>
        <div className="glass-card p-6">
          <div className="grid gap-6 md:grid-cols-3">
            {trips.map(t => (
              <TripCard key={t.id} id={t.id} title={t.title} dates={t.dates} members={t.members} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
