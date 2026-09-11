import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// GitHub Pages can build even when the private Supabase configuration has not
// been attached to Actions yet. Keep the UI renderable instead of crashing at
// module initialization; real auth automatically resumes once the variables
// are supplied.
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

const fallbackSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (_callback: unknown) => ({
      data: { subscription: { unsubscribe: () => undefined } },
    }),
    signInWithPassword: async () => ({
      data: { session: null, user: null },
      error: { message: 'اتصال به سرویس حساب کاربری هنوز تنظیم نشده است.' },
    }),
    signUp: async () => ({
      data: { session: null, user: null },
      error: { message: 'اتصال به سرویس حساب کاربری هنوز تنظیم نشده است.' },
    }),
    signOut: async () => ({ error: null }),
  },
} as unknown as SupabaseClient;

export const supabase: SupabaseClient = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : fallbackSupabase;
