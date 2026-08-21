import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** True once EXPO_PUBLIC_SUPABASE_URL/ANON_KEY are set — used to pick the real vs mock provider. */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error('Supabase is not configured (set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY).');
  }
  // No auth persistence yet (no login until M7); avoids needing a storage adapter.
  if (!client) client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
