"use client";
import { useState, useEffect } from 'react';
import Decimal from 'decimal.js-light';
import { equalSplit } from '../lib/expense';
import apiClient, { Expense, Settlement } from '../lib/apiClient';
import { useAuth } from '@/lib/authContext';

export function BudgetPanel({ tripId }: { tripId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [itineraryCost, setItineraryCost] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (tripId) {
      loadData();
    }
  }, [tripId]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, settlementsData, costSummary] = await Promise.all([
        apiClient.expenses.getByTrip(tripId),
        apiClient.settlements.getByTrip(tripId),
        apiClient.itinerary.getCostSummary(tripId).catch(() => null),
      ]);
      setExpenses(expensesData);
      setSettlements(settlementsData);
      setItineraryCost(costSummary?.totalCost || 0);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate total from expenses
  const expenseTotal = expenses.reduce((sum, exp) => sum + exp.amount_expe, 0);
  const combinedTotal = expenseTotal + itineraryCost;
  const t = new Decimal(combinedTotal || 0);
  const expenseT = new Decimal(expenseTotal || 0);
  const itineraryT = new Decimal(itineraryCost || 0);
  
  // Get unique participants from expense shares
  const participantsSet = new Set<string>();
  expenses.forEach(exp => {
    exp.t_expense_share_exsh?.forEach(share => {
      participantsSet.add(share.id_user);
    });
  });
  const participants = Array.from(participantsSet);
  
  const perPerson = participants.length > 0 ? t.div(participants.length).toFixed(2) : '0.00';
  
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between">
          <div className="card-title flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-base sm:text-lg">Budget</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
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
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Total Budget</div>
          <div className="text-lg sm:text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">${t.toFixed(2)}</div>
          {itineraryCost > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Expenses: ${expenseT.toFixed(2)} • Itinerary: ${itineraryT.toFixed(2)}
            </div>
          )}
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">Per person</div>
          <div className="text-lg sm:text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">${perPerson}</div>
        </div>
      </div>
      
      {itineraryCost > 0 && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>
              Itinerary costs (${itineraryT.toFixed(2)}) are now synced with your budget
            </span>
          </div>
        </div>
      )}
      
      {expenses.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Recent Expenses</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id_expe} className="flex items-center justify-between px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{expense.title_expe}</span>
                <span className="tabular-nums font-semibold text-sm text-slate-700 dark:text-slate-300">${expense.amount_expe.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {settlements.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Settlements</div>
          {settlements.map((settlement, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                <span className="font-medium">
                  {settlement.from.slice(0, 8)}... owes {settlement.to.slice(0, 8)}... ${settlement.amount.toFixed(2)}
                </span>
              </div>
              <button className="btn-secondary text-xs px-3 py-1.5 w-full sm:w-auto">Mark Paid</button>
            </div>
          ))}
        </div>
      )}
      
      {expenses.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
          No expenses yet. Add some in the Expenses page.
        </div>
      )}
    </div>
  );
}
