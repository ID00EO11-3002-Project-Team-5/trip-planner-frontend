"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import apiClient, { Expense, Trip, CreateExpensePayload } from "@/lib/apiClient";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { ExpenseStats } from "@/components/ExpenseStats";
import { exportExpensesToCSV, exportExpensesToPDF } from "@/lib/exportUtils";
import { useToast } from "@/components/ToastProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function ExpensesContent() {
  const { user } = useAuth();
  const { show } = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [tripMembers, setTripMembers] = useState<Array<{ id: string; name?: string; email?: string }>>([]);

  // Load trips
  useEffect(() => {
    if (!user) return;

    const loadTrips = async () => {
      try {
        const data = await apiClient.trips.getAll();
        setTrips(data);
        
        // Auto-select first trip if available
        if (data.length > 0 && !selectedTripId) {
          setSelectedTripId(data[0].id_trip);
        }
      } catch (error: any) {
        show(error.message || "Failed to load trips");
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [user]);

  // Load expenses when trip is selected
  useEffect(() => {
    if (!selectedTripId) {
      setExpenses([]);
      return;
    }

    const loadExpenses = async () => {
      setLoading(true);
      try {
        const data = await apiClient.expenses.getByTrip(selectedTripId);
        setExpenses(data);
      } catch (error: any) {
        show(error.message || "Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [selectedTripId]);

  // Load trip members (mock data for now - you can enhance this later)
  useEffect(() => {
    if (!selectedTripId || !user) return;
    
    // For now, add current user as a member
    // You can enhance this to load actual trip members from the backend
    setTripMembers([
      { id: user.id, name: user.email, email: user.email }
    ]);
  }, [selectedTripId, user]);

  const handleCreateExpense = async (expense: CreateExpensePayload) => {
    try {
      const newExpense = await apiClient.expenses.create(expense);
      setExpenses((prev) => [newExpense, ...prev]);
      setShowForm(false);
      show("Expense added successfully!");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create expense");
    }
  };

  const handleUpdateExpense = async (expense: CreateExpensePayload) => {
    if (!editingExpense) return;

    try {
      const updated = await apiClient.expenses.update(editingExpense.id_expe, {
        title_expe: expense.title_expe,
        amount_expe: expense.amount_expe,
        currency_expe: expense.currency_expe,
        shares: expense.shares,
      });
      
      setExpenses((prev) =>
        prev.map((e) => (e.id_expe === editingExpense.id_expe ? updated : e))
      );
      setEditingExpense(null);
      setShowForm(false);
      show("Expense updated successfully!");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update expense");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await apiClient.expenses.delete(expenseId);
      setExpenses((prev) => prev.filter((e) => e.id_expe !== expenseId));
      show("Expense deleted successfully!");
    } catch (error: any) {
      show(error.message || "Failed to delete expense");
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    

  const handleExportCSV = () => {
    const selectedTrip = trips.find(t => t.id_trip === selectedTripId);
    exportExpensesToCSV(expenses, selectedTrip?.title_trip || 'expenses');
    show("Expenses exported to CSV!");
  };

  const handleExportPDF = () => {
    const selectedTrip = trips.find(t => t.id_trip === selectedTripId);
    exportExpensesToPDF(expenses, selectedTrip?.title_trip || 'Expenses Report');
    show("Expenses exported to PDF!");
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title">Expenses</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track and split expenses for your trips
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Trip Selector */}
          <select
            className="input min-w-[200px]"
            value={selectedTripId}
            onChange={(e) => {
              setSelectedTripId(e.target.value);
              setShowForm(false);
              setEditingExpense(null);
            }}
          >
            <option value="">Select a trip</option>
            {trips.map((trip) => (
              <option key={trip.id_trip} value={trip.id_trip}>
                {trip.title_trip}
              </option>
            ))}
          </select>

          {selectedTripId && !showForm && (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Expense
              </button>
              
              {expenses.length > 0 && (
                <>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    📊 {showStats ? 'Hide' : 'Show'} Analytics
                  </button>
                  <div className="relative">
                    <button
                      className="btn-secondary flex items-center gap-2"
                      onClick={() => {
                        const menu = document.getElementById('export-menu');
                        menu?.classList.toggle('hidden');
                      }}
                    >
                      💾 Export
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div id="export-menu" className="hidden absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-10">
                      <button
                        onClick={() => {
                          handleExportCSV();
                          document.getElementById('export-menu')?.classList.add('hidden');
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        📄 Export CSV
                      </button>
                      <button
                        onClick={() => {
                          handleExportPDF();
                          document.getElementById('export-menu')?.classList.add('hidden');
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        📑 Export PDF
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* No Trip Selected */}
      {!selectedTripId && trips.length > 0 && (
        <div className="glass-card p-8 text-center">
          <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-slate-600 dark:text-slate-400">
            Select a trip from the dropdown to view and manage expenses
          </p>
        </div>
      )}

      {/* No Trips */}
      {!selectedTripId && trips.length === 0 && !loading && (
        <div className="glass-card p-8 text-center">
          <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-slate-600 dark:text-slate-400 mb-3">
            You don&apos;t have any trips yet
          </p>
          <a href="/planner" className="btn-primary inline-block">
            Create Your First Trip
          </a>
        </div>
      )}

      {/* Content when trip is selected */}
      {selectedTripId && (
        <>
          {/* Summary Statistics */}
          {!showForm && <ExpenseSummary expenses={expenses} />}

          {/* Expense Form */}
          {showForm && (
            <ExpenseForm
              tripId={selectedTripId}
              tripMembers={tripMembers}
              onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
              onCancel={handleCancelForm}
              initialData={editingExpense}
            />
          )}

          {/* Expense List */}
          {!showForm && (
            <div>
              <h2 className="text-lg font-semibold mb-3">
                All Expenses {expenses.length > 0 && `(${expenses.length})`}
              </h2>
              <ExpenseList
                expenses={expenses}
                onEdit={handleEdit}
                onDelete={handleDeleteExpense}
                loading={loading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <ProtectedRoute>
      <ExpensesContent />
    </ProtectedRoute>
  );
}
