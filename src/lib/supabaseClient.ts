import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function initSupabase(url?: string, anonKey?: string): SupabaseClient | null {
  const finalUrl = url || (import.meta as any).env?.VITE_SUPABASE_URL || localStorage.getItem('tb_sb_url') || '';
  const finalKey = anonKey || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('tb_sb_key') || '';

  if (!finalUrl || !finalKey) {
    supabaseInstance = null;
    return null;
  }

  try {
    // Basic structural check to avoid throwing inside createClient
    if (!finalUrl.startsWith('http')) {
      console.warn("Invalid Supabase URL format:", finalUrl);
      supabaseInstance = null;
      return null;
    }
    supabaseInstance = createClient(finalUrl, finalKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    return supabaseInstance;
  } catch (error) {
    console.warn("Supabase client creation error:", error);
    supabaseInstance = null;
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    return initSupabase();
  }
  return supabaseInstance;
}
