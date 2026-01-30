"use client";
import Decimal from 'decimal.js-light'
import { equalSplit } from '../lib/expense'

export function BudgetPanel({ total, participants }: { total: string | number; participants: string[] }) {
  const t = new Decimal(total || 0)
  const shares = equalSplit(t.toFixed(2), participants)
  return (
    <div className="space-y-4">
      <div className="font-medium">Budgeting Logic</div>
      <div className="text-sm">Total trip spend: <span className="tabular-nums">${t.toFixed(2)}</span></div>
      <ul className="rounded-xl border border-slate-200/60 divide-y divide-slate-200/60 bg-white/70 shadow-sm dark:border-slate-700 dark:divide-slate-700 dark:bg-slate-800/70">
        {shares.map(s => (
          <li key={s.name} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{s.name}</span>
            <span className="tabular-nums">${s.share}</span>
          </li>
        ))}
      </ul>
      <div className="text-xs text-slate-600 dark:text-slate-300">Action box: Jordan needs to pay Alex.
        <button className="ml-2 btn-secondary px-3 py-1">Mark as paid</button>
      </div>
    </div>
  )
}
