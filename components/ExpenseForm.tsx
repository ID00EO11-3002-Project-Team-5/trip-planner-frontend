"use client";

import { useState, useEffect } from "react";
import { CreateExpensePayload, ExpenseShare } from "@/lib/apiClient";
import { equalSplit } from "@/lib/expense";

interface ExpenseFormProps {
  tripId: string;
  tripMembers?: Array<{ id: string; name?: string; email?: string }>;
  onSubmit: (expense: CreateExpensePayload) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export function ExpenseForm({ tripId, tripMembers = [], onSubmit, onCancel, initialData }: ExpenseFormProps) {
  const [title, setTitle] = useState(initialData?.title_expe || "");
  const [amount, setAmount] = useState(initialData?.amount_expe?.toString() || "");
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>(initialData?.currency_expe || 'USD');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData?.t_expense_share_exsh) {
      const memberIds = initialData.t_expense_share_exsh.map((s: ExpenseShare) => s.id_user);
      setSelectedMembers(memberIds);
      
      const shares: Record<string, string> = {};
      initialData.t_expense_share_exsh.forEach((s: ExpenseShare) => {
        shares[s.id_user] = s.shareamount_exsh.toString();
      });
      setCustomShares(shares);
      setSplitType('custom');
    }
  }, [initialData]);

  const amountNum = parseFloat(amount) || 0;

  const calculateShares = (): ExpenseShare[] => {
    if (selectedMembers.length === 0) return [];

    if (splitType === 'equal') {
      const splits = equalSplit(amount, selectedMembers);
      return splits.map((split) => ({
        id_user: split.name,
        shareamount_exsh: parseFloat(split.share),
      }));
    } else {
      return selectedMembers
        .map((memberId) => ({
          id_user: memberId,
          shareamount_exsh: parseFloat(customShares[memberId] || "0"),
        }))
        .filter((share) => share.shareamount_exsh > 0);
    }
  };

  const shares = calculateShares();
  const totalShares = shares.reduce((sum, s) => sum + s.shareamount_exsh, 0);
  const isValid = title.trim() && amountNum > 0 && selectedMembers.length > 0 && Math.abs(totalShares - amountNum) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      setError("Please fill all required fields and ensure shares equal the total amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit({
        id_trip: tripId,
        title_expe: title,
        amount_expe: amountNum,
        currency_expe: currency,
        shares: shares,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return curr;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold">
        {initialData ? 'Edit Expense' : 'Add New Expense'}
      </h3>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          className="input"
          placeholder="e.g., Dinner at restaurant"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            className="input"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select
            className="input"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR' | 'GBP')}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Split Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
              splitType === 'equal'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            onClick={() => setSplitType('equal')}
          >
            Equal Split
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
              splitType === 'custom'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            onClick={() => setSplitType('custom')}
          >
            Custom Split
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Select Participants ({selectedMembers.length})
        </label>
        {tripMembers.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No trip members available. Add members to the trip first.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tripMembers.map((member) => (
              <label
                key={member.id}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => toggleMember(member.id)}
                  className="w-4 h-4"
                />
                <span className="flex-1 text-sm">
                  {member.name || member.email || member.id.substring(0, 8)}
                </span>
                {splitType === 'custom' && selectedMembers.includes(member.id) && (
                  <input
                    type="number"
                    className="w-24 px-2 py-1 text-sm border rounded"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={customShares[member.id] || ""}
                    onChange={(e) => {
                      setCustomShares((prev) => ({
                        ...prev,
                        [member.id]: e.target.value,
                      }));
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      {selectedMembers.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-blue-900 dark:text-blue-100">Total shares:</span>
            <span className={`font-medium tabular-nums ${
              Math.abs(totalShares - amountNum) < 0.01
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {getCurrencySymbol(currency)}{totalShares.toFixed(2)} / {getCurrencySymbol(currency)}{amountNum.toFixed(2)}
            </span>
          </div>
          {Math.abs(totalShares - amountNum) >= 0.01 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Shares must equal total amount
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={!isValid || loading}
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
