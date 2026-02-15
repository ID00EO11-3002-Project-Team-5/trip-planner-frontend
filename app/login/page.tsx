"use client";
import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Redirect to planner page on success
        router.push("/planner");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 px-4 sm:px-0">
      <div className="text-center space-y-2">
        <div className="section-title">eztrippin</div>
        <div className="text-sm text-slate-600 dark:text-slate-300">Welcome back</div>
      </div>
      
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            className="input" 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            className="input" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
        </div>

        <button 
          type="submit"
          className="w-full btn-primary mt-2"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-slate-900 dark:text-slate-100 font-medium hover:underline">
            Sign up
          </Link>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            type="button"
            className="btn-secondary w-full"
            onClick={() => setError("OAuth login coming soon!")}
          >
            Google
          </button>
          <button 
            type="button"
            className="btn-secondary w-full"
            onClick={() => setError("OAuth login coming soon!")}
          >
            GitHub
          </button>
        </div>

        <div className="text-xs text-center text-slate-500">
          <Link href="#" className="hover:underline">Privacy Policy</Link>
          {" · "}
          <Link href="#" className="hover:underline">Support</Link>
        </div>
      </form>
    </div>
  );
}
