"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="text-2xl font-semibold">Trip Planner</div>
        <div className="text-sm text-gray-600">Welcome back</div>
      </div>
      <div className="rounded border p-4 space-y-3">
        <label className="block text-sm font-medium">Email</label>
        <input className="w-full rounded border px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />

        <label className="block text-sm font-medium mt-2">Password</label>
        <input type="password" className="w-full rounded border px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />

        <button className="w-full rounded bg-black text-white py-2 mt-3 text-sm">Login</button>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button className="rounded border py-2 text-sm">Google</button>
          <button className="rounded border py-2 text-sm">GitHub</button>
        </div>

        <div className="text-xs text-gray-500 mt-3">Privacy Policy · Support</div>
      </div>
    </div>
  );
}
