"use client";
import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password, name);
      
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
        <div className="text-sm text-slate-600 dark:text-slate-300">Create your account</div>
      </div>
      
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input 
            className="input" 
            type="text"
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Jordan Smith"
            required
            disabled={loading}
          />
        </div>

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
          <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input 
            type="password" 
            className="input" 
            value={confirm} 
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
        </div>

        <button 
          type="submit"
          className="w-full btn-primary mt-2 text-sm"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-slate-900 dark:text-slate-100 font-medium hover:underline">
            Login
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
            onClick={() => setError("OAuth signup coming soon!")}
          >
            Google
          </button>
          <button 
            type="button"
            className="btn-secondary w-full"
            onClick={() => setError("OAuth signup coming soon!")}
          >
            GitHub
          </button>
        </div>

        <div className="text-xs text-center text-slate-500">
          By signing up, you agree to our{" "}
          <Link href="#" className="hover:underline">Privacy Policy</Link>
          {" and "}
          <Link href="#" className="hover:underline">Terms of Service</Link>
        </div>
      </form>
    </div>
  );
}
