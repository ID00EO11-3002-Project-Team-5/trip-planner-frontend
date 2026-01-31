"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="max-w-md mx-auto space-y-6 px-4 sm:px-0">
      <div className="text-center space-y-2">
        <div className="section-title">eztrippin</div>
        <div className="text-sm text-slate-600 dark:text-slate-300">Welcome back</div>
      </div>
      <div className="glass-card p-6 space-y-4">
        <label className="block text-sm font-medium">Email</label>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />

        <label className="block text-sm font-medium">Password</label>
        <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} />

        <button className="w-full btn-primary mt-2">Login</button>

        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary w-full">Google</button>
          <button className="btn-secondary w-full">GitHub</button>
        </div>

        <div className="text-xs text-slate-500">Privacy Policy · Support</div>
      </div>
    </div>
  );
}
