import { createClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { isWeb } from '../utils/platform';
import { secureStorage } from './secureStorage';

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
        // Native has no URL fragment to read tokens from, so use the code flow there
        flowType: isWeb ? 'implicit' : 'pkce',
        ...(isWeb ? {} : { storage: secureStorage }),
      },
    })
  : null;

export function getOAuthRedirectUrl(): string {
  if (isWeb && typeof window !== 'undefined') {
    return window.location.origin;
  }
  // hbplus://auth-callback in a standalone build, exp://<host>/--/auth-callback in Expo Go
  return Linking.createURL('auth-callback');
}
