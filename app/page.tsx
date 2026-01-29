import Link from "next/link";
import { TripCard } from "../components/TripCard";

export default function HomePage() {
  const trips = [
    { id: "summer-portugal", title: "Summer in Portugal", dates: "July 12 - July 20", members: 3 },
    { id: "alps-weekend", title: "Alps Weekend", dates: "Aug 5 - Aug 8", members: 4 },
    { id: "tokyo-fall", title: "Tokyo in Fall", dates: "Oct 10 - Oct 18", members: 2 },
  ];
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Plan better trips with friends</h1>
        <p className="text-gray-600 max-w-prose">
          Start a new trip or continue planning an existing one.
        </p>
      </section>
      <div className="flex items-center justify-between">
        <Link href="/workspace/new" className="rounded border px-3 py-2 text-sm">Start a new trip</Link>
        <div className="text-sm text-gray-600">Shared status: online</div>
      </div>
      <section className="space-y-3">
        <div className="text-sm font-medium">Your trips</div>
        <div className="grid gap-4 md:grid-cols-3">
          {trips.map(t => (
            <TripCard key={t.id} id={t.id} title={t.title} dates={t.dates} members={t.members} />
          ))}
        </div>
      </section>
    </div>
  );
}
