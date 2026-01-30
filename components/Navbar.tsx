import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/70">
      <div className="container max-w-7xl flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight hover:opacity-90 transition">Trip Planner</Link>
        <nav className="flex gap-4 text-sm items-center">
          <Link className="rounded-md px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition" href="/planner">Planner</Link>
          <Link className="rounded-md px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition" href="/expenses">Expenses</Link>
          <Link className="rounded-md px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition" href="/vault">Vault</Link>
          <span className="text-slate-300">|</span>
          <Link className="rounded-md px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition" href="/login">Login</Link>
          <Link className="btn-primary" href="/signup">Signup</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
