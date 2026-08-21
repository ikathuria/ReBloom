// lib/supabase — client + auth + opt-in cloud sync.
export { getSupabase, isSupabaseConfigured } from './client';
export { useAuth, signUpEmail, signInEmail, signOut, type AuthState } from './auth';
export { isSyncEnabled, setSyncEnabled, pushToCloud, deleteCloudData, SYNC_FLAG, type PushResult } from './sync';
