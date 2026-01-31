"use client";
import { useState } from "react";
import { useToast } from "../../components/ToastProvider";
import { equalSplit } from "../../lib/expense";

export default function ExpensesPage() {
  const [amount, setAmount] = useState("0");
  const [names, setNames] = useState<string[]>(["Alice", "Bob", "Charlie"]);
  const shares = equalSplit(amount, names);
  const { show } = useToast();

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="section-title">Expenses</h1>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <div className="glass-card p-4 sm:p-6 space-y-3">
          <label className="block text-sm font-medium">Total amount</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <label className="block text-sm font-medium mt-2">Participants</label>
          {names.map((n, i) => (
            <input
              key={i}
              className="input mt-2"
              value={n}
              onChange={(e) => {
                const copy = [...names];
                copy[i] = e.target.value;
                setNames(copy);
              }}
            />
          ))}
          <button
            className="mt-2 btn-secondary text-sm w-full sm:w-auto"
            onClick={() => {
              setNames((prev) => [...prev, ""]);
              show("Participant added");
            }}
          >Add participant</button>
        </div>
        <div className="space-y-2">
          <div className="glass-card p-4 sm:p-6">
            <h2 className="font-medium mb-3">Split</h2>
            <ul className="rounded-xl border border-slate-200/60 divide-y divide-slate-200/60 bg-white/70 shadow-sm dark:border-slate-700 dark:divide-slate-700 dark:bg-slate-800/70">
              {shares.map((s) => (
                <li key={s.name} className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
                  <span className="text-sm sm:text-base">{s.name || <em className="text-slate-500">Unnamed</em>}</span>
                  <span className="tabular-nums text-sm sm:text-base">${s.share}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 px-1">
            Equal split rounded to cents with fair distribution of remainders.
          </p>
        </div>
      </div>
    </div>
  );
}
