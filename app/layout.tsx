import "./globals.css";
import { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { ToastProvider } from "../components/ToastProvider";

export const metadata = {
  title: "Trip Planner",
  description: "Plan trips with friends collaboratively",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 text-slate-900 dark:text-slate-100 antialiased">
        <Navbar />
        <ToastProvider>
          <main className="container max-w-7xl flex-1 py-10">{children}</main>
        </ToastProvider>
        <footer className="mt-8 border-t bg-white/70 dark:bg-slate-800/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-800/60 py-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="container max-w-7xl">© {new Date().getFullYear()} Trip Planner</div>
        </footer>
      </body>
    </html>
  );
}
