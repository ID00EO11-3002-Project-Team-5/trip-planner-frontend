import Link from 'next/link'

export function TripCard({ title, dates, id, members = 3 }: { title: string; dates: string; id: string; members?: number }) {
  return (
    <Link href={`/workspace/${id}`} className="block rounded-lg border p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-xs text-gray-600">{dates}</div>
        </div>
        <div className="text-xs bg-gray-100 rounded px-2 py-1">{members} members</div>
      </div>
    </Link>
  )
}
