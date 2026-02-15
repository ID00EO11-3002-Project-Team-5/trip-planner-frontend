import "./globals.css";
import { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { ToastProvider } from "../components/ToastProvider";
import { AuthProvider } from "../lib/authContext";

export const metadata = {
  title: "eztrippin",
  description: "Plan trips with friends — the easy way",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
        <AuthProvider>
          <Navbar />
          <ToastProvider>
            <main className="container max-w-7xl flex-1 py-4 md:py-6 lg:py-8">{children}</main>
          </ToastProvider>
        </AuthProvider>
        <footer className="mt-auto border-t border-slate-200/60 bg-white/60 dark:bg-slate-800/60 dark:border-slate-700/60 backdrop-blur-lg">
          <div className="container max-w-7xl py-6 sm:py-8">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">eztrippin</span>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">About</a>
                <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Terms</a>
              </div>
              <div className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                © {new Date().getFullYear()} eztrippin. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
