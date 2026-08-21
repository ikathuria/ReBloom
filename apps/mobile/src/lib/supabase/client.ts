import 'react-native-url-polyfill/auto';

import { AppState } from 'react-native';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { secureStoreAdapter } from './storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** True once EXPO_PUBLIC_SUPABASE_URL/ANON_KEY are set — used to pick the real vs mock provider. */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error('Supabase is not configured (set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY).');
  }
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        storage: secureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // no URL-based sessions in native
      },
    });
    // Refresh tokens only while the app is foregrounded (Supabase RN guidance).
    AppState.addEventListener('change', (state) => {
      if (state === 'active') client?.auth.startAutoRefresh();
      else client?.auth.stopAutoRefresh();
    });
  }
  return client;
}
