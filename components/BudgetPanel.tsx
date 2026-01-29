"use client";
import Decimal from 'decimal.js-light'
import { equalSplit } from '../lib/expense'

export function BudgetPanel({ total, participants }: { total: string | number; participants: string[] }) {
  const t = new Decimal(total || 0)
  const shares = equalSplit(t.toFixed(2), participants)
  return (
    <div className="rounded border p-4 space-y-3">
      <div className="font-medium">Budgeting Logic</div>
      <div className="text-sm">Total trip spend: <span className="tabular-nums">${t.toFixed(2)}</span></div>
      <ul className="divide-y rounded border">
        {shares.map(s => (
          <li key={s.name} className="flex items-center justify-between px-3 py-2 text-sm">
            <span>{s.name}</span>
            <span className="tabular-nums">${s.share}</span>
          </li>
        ))}
      </ul>
      <div className="text-xs text-gray-600">Action box: Jordan needs to pay Alex. <button className="ml-2 rounded border px-2 py-1">Mark as paid</button></div>
    </div>
  )
}
