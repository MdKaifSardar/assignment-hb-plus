import { createClient } from '@supabase/supabase-js';
import { isWeb } from '../utils/platform';

const rawUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: isWeb,
      },
    })
  : null;

export function getOAuthRedirectUrl(): string {
  if (isWeb && typeof window !== 'undefined') {
    return `${window.location.origin}`;
  }
  return 'hbplus://auth-callback';
}
