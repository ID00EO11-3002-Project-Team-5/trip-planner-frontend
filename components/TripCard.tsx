import Link from 'next/link'

export function TripCard({ title, dates, id, members = 3 }: { title: string; dates: string; id: string; members?: number }) {
  return (
    <Link href={`/workspace/${id}`} className="block glass-card p-4 hover:shadow-md transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium tracking-tight">{title}</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">{dates}</div>
        </div>
        <div className="pill">{members} members</div>
      </div>
    </Link>
  )
}
