"use client";
import { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: number; message: string };

type ToastContextType = {
  show: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-16 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="glass-card px-4 py-2 text-sm shadow-md">{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
