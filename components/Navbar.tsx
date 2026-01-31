"use client";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:border-slate-700/60 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/70">
      <div className="container max-w-7xl flex items-center justify-between py-3 md:py-4">
        <Link href="/" className="flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight hover:opacity-80 transition">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-slate-900 dark:text-slate-100">eztrippin</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1 text-sm items-center">
          <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors" href="/planner">Planner</Link>
          <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors" href="/expenses">Expenses</Link>
          <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors" href="/vault">Vault</Link>
          <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-2" />
          <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors" href="/login">Login</Link>
          <Link className="btn-primary text-sm" href="/signup">Sign up</Link>
          <ThemeToggle />
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <nav className="container max-w-7xl py-4 space-y-1">
            <Link className="block rounded-lg px-4 py-3 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors" href="/planner" onClick={() => setMenuOpen(false)}>Planner</Link>
            <Link className="block rounded-lg px-4 py-3 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors" href="/expenses" onClick={() => setMenuOpen(false)}>Expenses</Link>
            <Link className="block rounded-lg px-4 py-3 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors" href="/vault" onClick={() => setMenuOpen(false)}>Vault</Link>
            <div className="border-t border-slate-200/60 dark:border-slate-700/60 my-2" />
            <Link className="block rounded-lg px-4 py-3 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors" href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link className="block btn-primary text-center mx-4" href="/signup" onClick={() => setMenuOpen(false)}>Sign up</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
