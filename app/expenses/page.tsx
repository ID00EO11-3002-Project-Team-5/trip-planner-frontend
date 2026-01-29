"use client";
import { useState } from "react";
import { equalSplit } from "../../lib/expense";

export default function ExpensesPage() {
  const [amount, setAmount] = useState("0");
  const [names, setNames] = useState<string[]>(["Alice", "Bob", "Charlie"]);
  const shares = equalSplit(amount, names);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Expenses</h1>
      <div className="grid gap-4 md:grid-cols-[1fr,1fr]">
        <div className="space-y-3">
          <label className="block text-sm font-medium">Total amount</label>
          <input
            className="w-full rounded border px-3 py-2"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <label className="block text-sm font-medium mt-3">Participants</label>
          {names.map((n, i) => (
            <input
              key={i}
              className="w-full rounded border px-3 py-2 mt-2"
              value={n}
              onChange={(e) => {
                const copy = [...names];
                copy[i] = e.target.value;
                setNames(copy);
              }}
            />
          ))}
          <button
            className="mt-2 rounded border px-3 py-2 text-sm"
            onClick={() => setNames((prev) => [...prev, ""]) }
          >Add participant</button>
        </div>
        <div className="space-y-2">
          <h2 className="font-medium">Split</h2>
          <ul className="rounded border divide-y">
            {shares.map((s) => (
              <li key={s.name} className="flex items-center justify-between px-3 py-2">
                <span>{s.name || <em className="text-gray-500">Unnamed</em>}</span>
                <span className="tabular-nums">${s.share}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-600">
            Equal split rounded to cents with fair distribution of remainders.
          </p>
        </div>
      </div>
    </div>
  );
}
