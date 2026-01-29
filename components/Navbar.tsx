import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-semibold">Trip Planner</Link>
        <nav className="flex gap-4 text-sm items-center">
          <Link className="hover:underline" href="/planner">Planner</Link>
          <Link className="hover:underline" href="/expenses">Expenses</Link>
          <Link className="hover:underline" href="/vault">Vault</Link>
          <span className="text-gray-300">|</span>
          <Link className="hover:underline" href="/login">Login</Link>
          <Link className="hover:underline" href="/signup">Signup</Link>
        </nav>
      </div>
    </header>
  );
}
