
// SafeAuthProvider.tsx - Simplified with better error handling
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SafeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);

  // Simplified role fetcher with immediate fallback
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    console.log('🔍 Fetching role for user:', userId);
    
    try {
      // Set a shorter timeout - 5 seconds max
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Role fetch timeout - using fallback');
        controller.abort();
      }, 5000);

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ Role fetch error:', error.message);
        console.log('🛡️ Using fallback role: read-only');
        return 'read-only';
      }

      if (data?.role) {
        const role = data.role as UserRole;
        console.log('✅ Role fetched successfully:', role);
        return role;
      }

      console.log('📝 No role found, using fallback: read-only');
      return 'read-only';

    } catch (error: any) {
      console.error('💥 Role fetch failed:', error.message);
      console.log('🛡️ Using fallback role: read-only');
      return 'read-only';
    }
  }, []);

  // Initialize authentication
  const initializeAuth = useCallback(async (newSession: Session | null) => {
    const user = newSession?.user || null;
    
    console.log('🚀 initializeAuth called:', {
      hasSession: !!newSession,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email
    });
    
    // Prevent duplicate initialization
    if (user?.id === currentUserId.current && isInitialized.current) {
      console.log('🔄 Auth already initialized - skipping');
      return;
    }

    currentUserId.current = user?.id || null;

    if (!newSession || !user) {
      console.log('🚀 No session - clearing auth state');
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      setIsLoading(false);
      setError(null);
      isInitialized.current = false;
      return;
    }

    console.log('🚀 Setting session and user state');
    setSession(newSession);
    setCurrentUser(user);
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting role fetch...');
      const role = await fetchUserRole(user.id);
      console.log('🚀 Role fetch completed:', role);
      
      setUserRole(role);
      setIsLoading(false);
      setError(null);
      isInitialized.current = true;
      
      console.log('🎉 Auth initialization complete:', { email: user.email, role });

    } catch (error: any) {
      console.error('💥 Auth initialization failed:', error.message);
      
      // Always set fallback to prevent infinite loading
      setUserRole('read-only');
      setIsLoading(false);
      setError(null); // Don't show error to user, just use fallback
      isInitialized.current = true;
      
      console.log('🛡️ Using fallback state due to error');
    }
  }, [fetchUserRole]);

  // Auth state change listener
  useEffect(() => {
    console.log('🎧 Setting up auth listener');
    
    // Emergency timeout to prevent infinite loading (reduced to 15 seconds)
    const emergencyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('🚨 Emergency timeout - forcing auth completion');
        setIsLoading(false);
        setUserRole('read-only');
        setError(null);
      }
    }, 15000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email || 'no user');
      
      clearTimeout(emergencyTimeout);
      
      if (event === 'SIGNED_OUT') {
        console.log('🔔 User signed out - resetting state');
        isInitialized.current = false;
        currentUserId.current = null;
      }
      
      await initializeAuth(session);
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔔 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Initial session error:', error);
          setIsLoading(false);
          setUserRole('read-only');
          setError(null);
          return;
        }
        console.log('🔔 Initial session retrieved:', { hasSession: !!session, userId: session?.user?.id });
        await initializeAuth(session);
      } catch (error: any) {
        console.error('Initial auth error:', error);
        setIsLoading(false);
        setUserRole('read-only');
        setError(null);
      }
    };

    getInitialSession();

    return () => {
      console.log('🧹 Cleaning up auth listener');
      subscription.unsubscribe();
      clearTimeout(emergencyTimeout);
    };
  }, [initializeAuth]);

  const signOut = useCallback(async () => {
    console.log('👋 Signing out');
    
    try {
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error: any) {
      console.error('❌ Unexpected sign out error:', error);
    }
  }, []);

  const refetch = useCallback(async () => {
    console.log('🔄 Refreshing auth state');
    if (currentUser) {
      try {
        const role = await fetchUserRole(currentUser.id);
        setUserRole(role);
      } catch (error) {
        console.error('Refetch error:', error);
        setUserRole('read-only');
      }
    }
  }, [currentUser, fetchUserRole]);

  const contextValue = useMemo(() => ({
    currentUser,
    session,
    userRole,
    isLoading,
    error,
    signOut,
    refetch
  }), [currentUser, session, userRole, isLoading, error, signOut, refetch]);

  // Debug logging
  useEffect(() => {
    console.log('=== SAFE AUTH PROVIDER RENDER ===', { 
      currentUser: !!currentUser, 
      userRole, 
      isLoading, 
      error,
      timestamp: new Date().toISOString()
    });
  }, [currentUser, userRole, isLoading, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn('⚠️ useAuth called outside SafeAuthProvider - using fallback state');
    
    return {
      currentUser: null,
      session: null,
      userRole: null,
      isLoading: false,
      error: 'Auth provider not found',
      signOut: async () => console.warn('signOut called outside provider'),
      refetch: async () => console.warn('refetch called outside provider')
    };
  }
  return context;
};
