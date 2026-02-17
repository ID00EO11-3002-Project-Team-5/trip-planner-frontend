"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!supabase);

  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client not initialized. Check environment variables.');
      return;
    }

    // Check active session on mount
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    }).catch((error: any) => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes including token expiration
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        // Update token in localStorage
        if (session?.access_token) {
          localStorage.setItem('authToken', session.access_token);
        }
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitor session expiration and auto-logout
  useEffect(() => {
    if (!supabase || !user) return;

    const checkSessionExpiration = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.expires_at) {
        const expiresAt = data.session.expires_at * 1000; // Convert to milliseconds
        const now = Date.now();
        
        // If session has expired, sign out
        if (now >= expiresAt) {
          console.log('Session expired, logging out...');
          await supabase.auth.signOut();
          localStorage.removeItem('authToken');
          setUser(null);
          window.location.href = '/login?expired=true';
        }
      }
    };

    // Check expiration every 30 seconds
    const interval = setInterval(checkSessionExpiration, 30000);
    
    // Check immediately on mount
    checkSessionExpiration();

    return () => clearInterval(interval);
  }, [user]);

  const signUp = async (email: string, password: string, name?: string) => {
    if (!supabase) {
      return { error: 'Authentication service not available' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // Store token if available
      if (data.session?.access_token) {
        localStorage.setItem('authToken', data.session.access_token);
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'An error occurred during signup' };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: 'Authentication service not available' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // Store token
      if (data.session?.access_token) {
        localStorage.setItem('authToken', data.session.access_token);
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'An error occurred during login' };
    }
  };

  const signOut = async () => {
    if (!supabase) {
      localStorage.removeItem('authToken');
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
