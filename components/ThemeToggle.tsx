"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem("theme");
    const preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = stored ? stored === 'dark' : preferDark;
    document.documentElement.classList.toggle('dark', initialDark);
    return initialDark;
  });
  useEffect(() => {
    // Initialization already handled in useState
  }, []);

  function toggle() {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  }

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="rounded-md px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
