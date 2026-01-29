import "./globals.css";
import { ReactNode } from "react";
import { Navbar } from "../components/Navbar";

export const metadata = {
  title: "Trip Planner",
  description: "Plan trips with friends collaboratively",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container flex-1 py-6">{children}</main>
        <footer className="border-t py-4 text-sm text-gray-500">
          <div className="container">© {new Date().getFullYear()} Trip Planner</div>
        </footer>
      </body>
    </html>
  );
}
