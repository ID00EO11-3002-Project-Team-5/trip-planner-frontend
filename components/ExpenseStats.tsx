"use client";
import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense } from '@/lib/apiClient';

interface ExpenseStatsProps {
  expenses: Expense[];
  budgetAmount?: number;
}

const EXPENSE_CATEGORIES = [
  { key: 'accommodation', label: 'Accommodation', color: '#3b82f6' },
  { key: 'food', label: 'Food & Dining', color: '#10b981' },
  { key: 'transport', label: 'Transportation', color: '#f59e0b' },
  { key: 'activities', label: 'Activities', color: '#8b5cf6' },
  { key: 'shopping', label: 'Shopping', color: '#ec4899' },
  { key: 'other', label: 'Other', color: '#6b7280' },
];

export function ExpenseStats({ expenses, budgetAmount = 0 }: ExpenseStatsProps) {
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount_expe, 0);
    
    // Categorize expenses by title keywords
    const categorized = expenses.reduce((acc, exp) => {
      const title = exp.title_expe.toLowerCase();
      let category = 'other';
      
      if (title.includes('hotel') || title.includes('airbnb') || title.includes('accommodation') || title.includes('lodging')) {
        category = 'accommodation';
      } else if (title.includes('food') || title.includes('dinner') || title.includes('lunch') || title.includes('breakfast') || title.includes('restaurant') || title.includes('meal')) {
        category = 'food';
      } else if (title.includes('transport') || title.includes('taxi') || title.includes('uber') || title.includes('flight') || title.includes('train') || title.includes('bus') || title.includes('car')) {
        category = 'transport';
      } else if (title.includes('tour') || title.includes('ticket') || title.includes('museum') || title.includes('activity') || title.includes('attraction')) {
        category = 'activities';
      } else if (title.includes('shop') || title.includes('souvenir') || title.includes('gift')) {
        category = 'shopping';
      }
      
      if (!acc[category]) acc[category] = 0;
      acc[category] += exp.amount_expe;
      return acc;
    }, {} as Record<string, number>);

    // Prepare data for charts
    const categoryData = EXPENSE_CATEGORIES.map(cat => ({
      name: cat.label,
      value: categorized[cat.key] || 0,
      color: cat.color,
    })).filter(cat => cat.value > 0);

    // Calculate per-person breakdown
    const personMap = new Map<string, { spent: number; owes: number; name: string }>();
    
    expenses.forEach(exp => {
      // Track who spent money (payers)
      exp.t_expense_payer_expa?.forEach(payer => {
        if (!personMap.has(payer.id_user)) {
          personMap.set(payer.id_user, { spent: 0, owes: 0, name: payer.id_user.substring(0, 8) });
        }
        const person = personMap.get(payer.id_user)!;
        person.spent += payer.payeramount_expa;
      });

      // Track who owes money (shares)
      exp.t_expense_share_exsh?.forEach(share => {
        if (!personMap.has(share.id_user)) {
          personMap.set(share.id_user, { spent: 0, owes: 0, name: share.id_user.substring(0, 8) });
        }
        const person = personMap.get(share.id_user)!;
        person.owes += share.shareamount_exsh;
      });
    });

    const perPersonData = Array.from(personMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      spent: data.spent,
      owes: data.owes,
      balance: data.spent - data.owes,
    }));

    return {
      total,
      categorized,
      categoryData,
      perPersonData,
      remaining: budgetAmount > 0 ? budgetAmount - total : 0,
      percentUsed: budgetAmount > 0 ? (total / budgetAmount) * 100 : 0,
    };
  }, [expenses, budgetAmount]);

  if (expenses.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-slate-400">
          <p className="text-sm">No expense data to visualize</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget vs Actual */}
      {budgetAmount > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-medium text-lg mb-4">Budget Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Budget</span>
              <span className="font-semibold">${budgetAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Spent</span>
              <span className="font-semibold">${stats.total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Remaining</span>
              <span className={`font-semibold ${stats.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(stats.remaining).toFixed(2)} {stats.remaining < 0 && '(over)'}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{stats.percentUsed.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    stats.percentUsed <= 75 ? 'bg-green-500' :
                    stats.percentUsed <= 100 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(stats.percentUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown with Pie Chart */}
      <div className="glass-card p-6">
        <h3 className="font-medium text-lg mb-4">Spending by Category</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value != null ? `$${Number(value).toFixed(2)}` : '$0.00'} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {stats.categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm">{cat.name}</span>
                </div>
                <span className="font-semibold">${cat.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-Person Summary */}
      {stats.perPersonData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-medium text-lg mb-4">Per-Person Summary</h3>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.perPersonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => value != null ? `$${Number(value).toFixed(2)}` : '$0.00'} />
                <Legend />
                <Bar dataKey="spent" fill="#10b981" name="Paid" />
                <Bar dataKey="owes" fill="#3b82f6" name="Owes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {stats.perPersonData.map((person) => (
              <div key={person.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-sm font-medium">{person.name}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">Paid: ${person.spent.toFixed(2)}</span>
                  <span className="text-blue-600">Owes: ${person.owes.toFixed(2)}</span>
                  <span className={`font-semibold ${person.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {person.balance >= 0 ? '+' : ''}${person.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
