"use client";
import Decimal from 'decimal.js-light'
import { equalSplit } from '../lib/expense'

export function BudgetPanel({ total, participants }: { total: string | number; participants: string[] }) {
  const t = new Decimal(total || 0)
  const shares = equalSplit(t.toFixed(2), participants)
  const perPerson = participants.length > 0 ? t.div(participants.length).toFixed(2) : '0.00'
  
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between">
        <div className="card-title flex items-center gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-base sm:text-lg">Budget</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Total spend</div>
          <div className="text-lg sm:text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">${t.toFixed(2)}</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">Per person</div>
          <div className="text-lg sm:text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">${perPerson}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Breakdown</div>
        <ul className="rounded-xl border border-slate-200/60 divide-y divide-slate-100 bg-white/80 dark:border-slate-700/60 dark:divide-slate-700/60 dark:bg-slate-800/80">
          {shares.map((s, i) => (
            <li key={s.name} className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white ${
                  ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'][i % 4]
                }`}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm sm:text-base text-slate-900 dark:text-slate-100">{s.name}</span>
              </div>
              <span className="tabular-nums font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-300">${s.share}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-700 dark:text-amber-300">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Jordan owes Alex $300</span>
        </div>
        <button className="btn-secondary text-xs px-3 py-1.5 w-full sm:w-auto">Settle up</button>
      </div>
    </div>
  )
}
