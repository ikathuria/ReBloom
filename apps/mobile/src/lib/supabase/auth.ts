import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { getSupabase, isSupabaseConfigured } from './client';

export const signUpEmail = (email: string, password: string) =>
  getSupabase().auth.signUp({ email, password });

export const signInEmail = (email: string, password: string) =>
  getSupabase().auth.signInWithPassword({ email, password });

export const signOut = () => getSupabase().auth.signOut();

/**
 * Exchange an Apple identity token for a Supabase session (Sign in with Apple).
 *
 * The native step — `AppleAuthentication.signInAsync()` from `expo-apple-authentication` — runs at
 * the call site and yields the `identityToken`; this helper does the Supabase side. Kept as a seam
 * so the (native, entitlement-gated) package stays out of the JS bundle until it's installed and a
 * dev build exists. Enable at deploy — see docs/05-deploy.md. Requires the "Sign in with Apple"
 * capability + `ios.usesAppleSignIn` and the Apple provider configured in Supabase Auth.
 */
export const signInWithAppleToken = (identityToken: string) =>
  getSupabase().auth.signInWithIdToken({ provider: 'apple', token: identityToken });

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
