"use client";

import { Expense } from "@/lib/apiClient";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  loading?: boolean;
}

export function ExpenseList({ expenses, onEdit, onDelete, loading }: ExpenseListProps) {
  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-slate-400 dark:text-slate-500">
          <svg className="w-16 h-16 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">No expenses yet</p>
          <p className="text-xs mt-1">Add your first expense to get started</p>
        </div>
      </div>
    );
  }

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const totalShares = expense.t_expense_share_exsh?.length || 0;
        const totalPayers = expense.t_expense_payer_expa?.length || 0;

        return (
          <div
            key={expense.id_expe}
            className="glass-card p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {expense.title_expe}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-400">
                  <span>{formatDate(expense.createdat_expe)}</span>
                  <span>•</span>
                  <span>{totalShares} {totalShares === 1 ? 'person' : 'people'} splitting</span>
                  {totalPayers > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 dark:text-green-400">
                        {totalPayers} paid
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <div className="text-xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {getCurrencySymbol(expense.currency_expe)}
                    {expense.amount_expe.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {expense.currency_expe}
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                    title="Edit expense"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${expense.title_expe}"?`)) {
                        onDelete(expense.id_expe);
                      }
                    }}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition"
                    title="Delete expense"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Show split details if available */}
            {expense.t_expense_share_exsh && expense.t_expense_share_exsh.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">Split among:</div>
                <div className="flex flex-wrap gap-2">
                  {expense.t_expense_share_exsh.map((share, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs"
                    >
                      <span className="font-mono">
                        {getCurrencySymbol(expense.currency_expe)}
                        {share.shareamount_exsh.toFixed(2)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 ml-1">
                        ({share.id_user.substring(0, 8)}...)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
