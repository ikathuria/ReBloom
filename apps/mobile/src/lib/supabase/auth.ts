import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { getSupabase, isSupabaseConfigured } from './client';

export const signUpEmail = (email: string, password: string) =>
  getSupabase().auth.signUp({ email, password });

export const signInEmail = (email: string, password: string) =>
  getSupabase().auth.signInWithPassword({ email, password });

export const signOut = () => getSupabase().auth.signOut();

export interface AuthState {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  email: string | null;
}

/** Live auth state. Safe when Supabase isn't configured (returns configured:false, never throws). */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { configured: isSupabaseConfigured, loading, session, email: session?.user?.email ?? null };
}
