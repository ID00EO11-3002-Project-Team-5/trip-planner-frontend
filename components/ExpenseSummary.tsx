"use client";

import { Expense } from "@/lib/apiClient";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  if (expenses.length === 0) {
    return null;
  }

  // Calculate totals by currency
  const totals = expenses.reduce((acc, expense) => {
    const currency = expense.currency_expe;
    if (!acc[currency]) {
      acc[currency] = 0;
    }
    acc[currency] += expense.amount_expe;
    return acc;
  }, {} as Record<string, number>);

  // Calculate per-person spending (simplified)
  const userSpending: Record<string, Record<string, number>> = {};
  
  expenses.forEach((expense) => {
    expense.t_expense_share_exsh?.forEach((share) => {
      if (!userSpending[share.id_user]) {
        userSpending[share.id_user] = {};
      }
      if (!userSpending[share.id_user][expense.currency_expe]) {
        userSpending[share.id_user][expense.currency_expe] = 0;
      }
      userSpending[share.id_user][expense.currency_expe] += share.shareamount_exsh;
    });
  });

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency;
    }
  };

  const totalExpenses = expenses.length;
  const currencies = Object.keys(totals);
  const uniqueParticipants = Object.keys(userSpending).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Expenses Card */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</p>
            <p className="text-2xl font-semibold mt-1">{totalExpenses}</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Spent Card */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Spent</p>
            <div className="mt-1 space-y-0.5">
              {currencies.map((currency) => (
                <p key={currency} className="text-xl font-semibold tabular-nums truncate">
                  {getCurrencySymbol(currency)}{totals[currency].toFixed(2)}
                </p>
              ))}
            </div>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Participants Card */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Participants</p>
            <p className="text-2xl font-semibold mt-1">{uniqueParticipants}</p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Average per Expense Card */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg per Expense</p>
            <div className="mt-1 space-y-0.5">
              {currencies.map((currency) => (
                <p key={currency} className="text-xl font-semibold tabular-nums truncate">
                  {getCurrencySymbol(currency)}
                  {(totals[currency] / expenses.filter(e => e.currency_expe === currency).length).toFixed(2)}
                </p>
              ))}
            </div>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Per-Person Breakdown */}
      {uniqueParticipants > 0 && (
        <div className="glass-card p-4 sm:col-span-2 lg:col-span-4">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Per-Person Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Object.entries(userSpending).map(([userId, amounts]) => (
              <div
                key={userId}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate mb-1">
                  {userId.substring(0, 12)}...
                </p>
                <div className="space-y-0.5">
                  {Object.entries(amounts).map(([currency, amount]) => (
                    <p key={currency} className="text-sm font-medium tabular-nums">
                      {getCurrencySymbol(currency)}{amount.toFixed(2)}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
