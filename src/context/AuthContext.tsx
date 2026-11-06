import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../constants/config';
import { AuthContextType, AuthSession, UserProfile } from '../types/auth';
import { extractDomain, resolveUserRole, validateEmailDomain } from '../utils/domain';
import { sessionStorage, SESSION_STORAGE_KEY } from '../services/storage';
import { auditLogService } from '../services/auditLog';
import { userService } from '../services/userService';
import { isSupabaseConfigured, supabase, getOAuthRedirectUrl } from '../services/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let authListenerSubscription: { unsubscribe: () => void } | null = null;

    async function handleSessionVerification(email: string, rawSessionData: any) {
      const domainCheck = validateEmailDomain(email);

      if (!domainCheck.isValid) {
        if (isSupabaseConfigured && supabase) {
          await supabase.auth.signOut();
        }
        await auditLogService.logEvent({
          email,
          domain: extractDomain(email),
          status: 'rejected',
          reason: 'Live OAuth callback with unauthorized domain',
        });
        if (isMounted) {
          setUser(null);
          setSession(null);
          setError(APP_CONFIG.messages.accessRestricted);
        }
        return false;
      }

      const role = resolveUserRole(email);
      const authUser: UserProfile = {
        id: rawSessionData.user.id,
        email,
        displayName:
          rawSessionData.user.user_metadata?.full_name ||
          rawSessionData.user.user_metadata?.name ||
          email.split('@')[0],
        avatarUrl: rawSessionData.user.user_metadata?.avatar_url,
        domain: domainCheck.domain!,
        role,
        lastLoginAt: new Date().toISOString(),
        createdAt: rawSessionData.user.created_at || new Date().toISOString(),
      };

      await userService.upsertUser(authUser);
      await auditLogService.logEvent({
        email,
        domain: domainCheck.domain,
        status: 'allowed',
        reason: 'Authorized domain login via Google OAuth',
      });

      const newSession: AuthSession = {
        accessToken: rawSessionData.access_token,
        refreshToken: rawSessionData.refresh_token,
        expiresAt: (rawSessionData.expires_at || 0) * 1000,
        user: authUser,
      };

      if (isMounted) {
        setUser(authUser);
        setSession(newSession);
      }
      return true;
    }

    async function hydrateSession() {
      try {
        if (isSupabaseConfigured && supabase) {
          // Listen for real-time OAuth redirects
          const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (event === 'SIGNED_IN' && currentSession?.user?.email) {
              await handleSessionVerification(currentSession.user.email, currentSession);
            }
          });
          authListenerSubscription = data.subscription;

          // Check current active session
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user?.email) {
            await handleSessionVerification(sessionData.session.user.email, sessionData.session);
            return;
          }
        }

        // Local storage fallback for sandbox sessions
        const rawSession = await sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!rawSession) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const parsedSession: AuthSession = JSON.parse(rawSession);
        const isExpired = Date.now() > parsedSession.expiresAt;
        const domainCheck = validateEmailDomain(parsedSession.user.email);

        if (isExpired || !domainCheck.isValid) {
          await sessionStorage.removeItem(SESSION_STORAGE_KEY);
          if (isMounted) {
            setUser(null);
            setSession(null);
            if (!domainCheck.isValid) {
              setError(APP_CONFIG.messages.accessRestricted);
            }
          }
        } else {
          if (isMounted) {
            setUser(parsedSession.user);
            setSession(parsedSession);
          }
        }
      } catch {
        await sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    hydrateSession();
    return () => {
      isMounted = false;
      authListenerSubscription?.unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Primary Google Sign-In Handler.
   * Redirects to real Google OAuth (accounts.google.com) via Supabase.
   */
  const signInWithGoogle = useCallback(
    async (providedEmail?: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase && !providedEmail) {
          const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: getOAuthRedirectUrl(),
              queryParams: {
                prompt: 'select_account',
              },
            },
          });
          if (oauthError) throw oauthError;
          return true;
        }

        if (!providedEmail) {
          setIsLoading(false);
          return false;
        }

        const emailToAuthenticate = providedEmail.trim();
        const domainCheck = validateEmailDomain(emailToAuthenticate);

        if (!domainCheck.isValid) {
          await auditLogService.logEvent({
            email: emailToAuthenticate,
            domain: extractDomain(emailToAuthenticate),
            status: 'rejected',
            reason: 'Domain mismatch against whitelist',
          });

          await sessionStorage.removeItem(SESSION_STORAGE_KEY);
          setUser(null);
          setSession(null);
          setError(APP_CONFIG.messages.accessRestricted);
          return false;
        }

        const role = resolveUserRole(emailToAuthenticate);
        const userName = emailToAuthenticate
          .split('@')[0]
          .split('.')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

        const authenticatedUser: UserProfile = {
          id: 'usr_' + Math.random().toString(36).substring(2, 10),
          email: emailToAuthenticate,
          displayName: userName,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`,
          domain: domainCheck.domain!,
          role,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        const newSession: AuthSession = {
          accessToken: 'tok_' + Math.random().toString(36).substring(2, 15),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          user: authenticatedUser,
        };

        await sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
        await userService.upsertUser(authenticatedUser);
        await auditLogService.logEvent({
          email: emailToAuthenticate,
          domain: domainCheck.domain,
          status: 'allowed',
          reason: 'Authorized domain match',
        });

        setUser(authenticatedUser);
        setSession(newSession);
        return true;
      } catch (err: any) {
        setError(err?.message || APP_CONFIG.messages.networkError);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      if (user) {
        await auditLogService.logEvent({
          email: user.email,
          domain: user.domain,
          status: 'signed_out',
          reason: 'User initiated logout',
        });
      }
      await sessionStorage.removeItem(SESSION_STORAGE_KEY);
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
