
// SafeAuthProvider.tsx - Clean implementation without syntax errors
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
  // State management
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for preventing infinite loops and race conditions
  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Safe role fetcher with comprehensive error handling
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    console.log('🔍 Fetching role for user:', userId);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: false })
        .limit(1);

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ Role fetch error:', error);
        return 'read-only';
      }

      if (data && data.length > 0) {
        const role = data[0].role as UserRole;
        console.log('✅ Role fetched successfully:', role);
        return role;
      }

      console.log('📝 No role found, using default role');
      return 'read-only';

    } catch (error: any) {
      console.error('💥 Role fetch failed:', error.message);
      
      if (error.name === 'AbortError') {
        console.log('⏰ Role fetch timeout');
      }
      
      console.log('🛡️ Using fallback role due to error');
      return 'read-only';
    }
  }, []);

  // Initialize authentication with safety checks
  const initializeAuth = useCallback(async (newSession: Session | null) => {
    const user = newSession?.user || null;
    
    // Prevent duplicate initialization
    if (user?.id === currentUserId.current && isInitialized.current) {
      console.log('🔄 Auth already initialized for this user');
      return;
    }

    console.log('🚀 Initializing auth for:', user?.email || 'no user');
    currentUserId.current = user?.id || null;

    if (!newSession || !user) {
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      setIsLoading(false);
      setError(null);
      retryCount.current = 0;
      isInitialized.current = false;
      return;
    }

    setSession(newSession);
    setCurrentUser(user);
    setIsLoading(true);
    setError(null);

    try {
      const role = await fetchUserRole(user.id);
      
      setUserRole(role);
      setIsLoading(false);
      setError(null);
      
      retryCount.current = 0;
      isInitialized.current = true;
      console.log('🎉 Auth initialization complete:', { email: user.email, role });

    } catch (error: any) {
      console.error('💥 Auth initialization failed:', error.message);
      
      retryCount.current++;
      
      if (retryCount.current >= maxRetries) {
        console.log('⚠️ Max retries reached, using fallback state');
        setUserRole('read-only');
        setIsLoading(false);
        setError(`Authentication failed after ${maxRetries} attempts: ${error.message}`);
      } else {
        console.log(`🔄 Retry ${retryCount.current}/${maxRetries} in 2 seconds...`);
        setTimeout(() => {
          if (currentUserId.current === user.id) {
            initializeAuth(newSession);
          }
        }, 2000);
      }
    }
  }, [fetchUserRole]);

  // Auth state change listener
  useEffect(() => {
    console.log('🎧 Setting up auth listener');
    
    // Emergency timeout to prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('🚨 Emergency timeout - forcing auth completion');
        setIsLoading(false);
        setError('Authentication timeout - please refresh the page');
      }
    }, 30000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email || 'no user');
      clearTimeout(emergencyTimeout);
      
      if (event === 'SIGNED_OUT') {
        isInitialized.current = false;
        currentUserId.current = null;
        retryCount.current = 0;
      }
      
      await initializeAuth(session);
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Initial session error:', error);
          setIsLoading(false);
          setError('Failed to get initial session');
          return;
        }
        await initializeAuth(session);
      } catch (error: any) {
        console.error('Initial auth error:', error);
        setIsLoading(false);
        setError('Authentication initialization failed');
      }
    };

    getInitialSession();

    return () => {
      console.log('🧹 Cleaning up auth listener');
      subscription.unsubscribe();
      clearTimeout(emergencyTimeout);
    };
  }, [initializeAuth]);

  // Action functions
  const signOut = useCallback(async () => {
    console.log('👋 Signing out');
    
    try {
      // Clear local state immediately for responsive UI
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      setError(null);
      
      // Then attempt Supabase sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        // Don't throw - local state is already cleared
      }
    } catch (error: any) {
      console.error('❌ Unexpected sign out error:', error);
      // Local state is already cleared, so this is fine
    }
  }, []);

  const refetch = useCallback(async () => {
    console.log('🔄 Refreshing auth state');
    if (currentUser) {
      const role = await fetchUserRole(currentUser.id);
      setUserRole(role);
    }
  }, [currentUser, fetchUserRole]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentUser,
    session,
    userRole,
    isLoading,
    error,
    signOut,
    refetch
  }), [currentUser, session, userRole, isLoading, error, signOut, refetch]);

  // Debug logging for development
  useEffect(() => {
    console.log('=== SAFE AUTH PROVIDER RENDER ===', { 
      currentUser: !!currentUser, 
      userRole, 
      isLoading, 
      error 
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
    
    // Return safe fallback values to prevent crashes
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
