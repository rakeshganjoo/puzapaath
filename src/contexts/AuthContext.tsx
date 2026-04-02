import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import {
  clearAuthSession,
  getCurrentUser,
  getStoredAuthSession,
  getValidAuthSession,
  processAuthCallback,
  processInitialAuthCallback,
  signOut as authSignOut,
  startGoogleSignIn,
  type AuthSession,
  type AuthUser,
} from '../services/AuthService';

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await getValidAuthSession();
    setSession(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const callbackSession = await processInitialAuthCallback();
        if (mounted && callbackSession) {
          setSession(callbackSession);
        } else if (mounted) {
          const next = await getValidAuthSession();
          setSession(next);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const subscription = Linking.addEventListener('url', async ({ url }) => {
      const callbackSession = await processAuthCallback(url);
      if (callbackSession && mounted) {
        setSession(callbackSession);
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await startGoogleSignIn();
  }, []);

  const signOut = useCallback(async () => {
    await clearAuthSession();
    setSession(null);
    await authSignOut();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    isAuthenticated: !!session,
    refresh,
    signInWithGoogle,
    signOut,
  }), [session, loading, refresh, signInWithGoogle, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth() must be used inside <AuthProvider>');
  return ctx;
}
