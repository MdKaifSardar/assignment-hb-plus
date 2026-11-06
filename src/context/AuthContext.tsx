import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { APP_CONFIG } from '../constants/config';
import { AuthContextType, AuthSession, UserProfile } from '../types/auth';
import { extractDomain, resolveUserRole, validateEmailDomain } from '../utils/domain';
import { auditLogService } from '../services/auditLog';
import { userService } from '../services/userService';
import { isSupabaseConfigured, supabase, getOAuthRedirectUrl } from '../services/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase emits SIGNED_IN on load, on tab refocus and again from getSession();
  // remember the token already verified so each login is audited once.
  const verifiedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function verifySession(raw: Session) {
      const email = raw.user.email;
      if (!email || verifiedToken.current === raw.access_token) return;
      verifiedToken.current = raw.access_token;

      const domainCheck = validateEmailDomain(email);

      if (!domainCheck.isValid) {
        await supabase!.auth.signOut();
        await auditLogService.logEvent({
          email,
          domain: extractDomain(email),
          status: 'rejected',
          reason: 'OAuth callback with unauthorized domain',
        });
        if (isMounted) {
          setUser(null);
          setSession(null);
          setError(APP_CONFIG.messages.accessRestricted);
        }
        return;
      }

      const profile = await userService.upsertUser({
        id: raw.user.id,
        email,
        displayName:
          raw.user.user_metadata?.full_name || raw.user.user_metadata?.name || email.split('@')[0],
        avatarUrl: raw.user.user_metadata?.avatar_url,
        domain: domainCheck.domain!,
        role: resolveUserRole(email),
        lastLoginAt: new Date().toISOString(),
        createdAt: raw.user.created_at,
      });

      await auditLogService.logEvent({
        email,
        domain: domainCheck.domain,
        status: 'allowed',
        reason: 'Authorized domain login via Google OAuth',
      });

      if (isMounted) {
        setUser(profile);
        setSession({
          accessToken: raw.access_token,
          refreshToken: raw.refresh_token,
          expiresAt: (raw.expires_at ?? 0) * 1000,
          user: profile,
        });
      }
    }

    const { data } = supabase.auth.onAuthStateChange((event, current) => {
      if (event === 'SIGNED_IN' && current) {
        verifySession(current).finally(() => isMounted && setIsLoading(false));
      }
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: existing } }) => (existing ? verifySession(existing) : undefined))
      .catch(() => undefined)
      .finally(() => isMounted && setIsLoading(false));

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      setError(APP_CONFIG.messages.networkError);
      return false;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthRedirectUrl(),
          queryParams: { prompt: 'select_account' },
        },
      });
      if (oauthError) throw oauthError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : APP_CONFIG.messages.networkError);
      setIsAuthenticating(false);
      return false;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabase?.auth.signOut();
      if (user) {
        await auditLogService.logEvent({
          email: user.email,
          domain: user.domain,
          status: 'signed_out',
          reason: 'User initiated logout',
        });
      }
      verifiedToken.current = null;
      setUser(null);
      setSession(null);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticating,
    error,
    signInWithGoogle,
    signOut,
    clearError,
    allowedDomain: APP_CONFIG.allowedDomain,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
