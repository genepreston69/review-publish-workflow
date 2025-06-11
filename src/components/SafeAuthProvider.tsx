
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SafeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Centralized state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  // Prevent infinite loops with refs
  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Safe state updater to prevent unnecessary re-renders
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => {
      const newState = { ...prev, ...updates };
      // Only update if something actually changed
      if (JSON.stringify(prev) === JSON.stringify(newState)) {
        return prev;
      }
      return newState;
    });
  }, []);

  // Memoized role fetcher with comprehensive error handling
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    console.log('🔍 Fetching role for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Role fetch error:', error);
        if (error.code === 'PGRST116') {
          // No profile found - return default role
          console.log('📝 No profile found, using default role');
          return 'read-only';
        }
        throw error;
      }

      const role = (data?.role as UserRole) || 'read-only';
      console.log('✅ Role fetched successfully:', role);
      return role;

    } catch (error: any) {
      console.error('💥 Role fetch failed:', error.message);
      
      // For other errors, return default role to prevent app crash
      console.log('🛡️ Using fallback role due to error');
      return 'read-only';
    }
  }, []);

  // Initialize authentication with safety checks
  const initializeAuth = useCallback(async (user: User | null) => {
    // Prevent duplicate initialization
    if (user?.id === currentUserId.current && isInitialized.current) {
      console.log('🔄 Auth already initialized for this user');
      return;
    }

    console.log('🚀 Initializing auth for:', user?.email || 'no user');
    currentUserId.current = user?.id || null;

    if (!user) {
      updateAuthState({
        user: null,
        role: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      });
      retryCount.current = 0;
      return;
    }

    updateAuthState({
      user,
      isAuthenticated: true,
      isLoading: true,
      error: null
    });

    try {
      const role = await fetchUserRole(user.id);
      
      updateAuthState({
        role,
        isLoading: false,
        error: null
      });
      
      retryCount.current = 0;
      isInitialized.current = true;
      console.log('🎉 Auth initialization complete:', { email: user.email, role });

    } catch (error: any) {
      console.error('💥 Auth initialization failed:', error.message);
      
      retryCount.current++;
      
      if (retryCount.current >= maxRetries) {
        console.log('⚠️ Max retries reached, using fallback state');
        updateAuthState({
          role: 'read-only',
          isLoading: false,
          error: `Authentication failed after ${maxRetries} attempts: ${error.message}`
        });
      } else {
        console.log(`🔄 Retry ${retryCount.current}/${maxRetries} in 2 seconds...`);
        setTimeout(() => {
          if (currentUserId.current === user.id) {
            initializeAuth(user);
          }
        }, 2000);
      }
    }
  }, [fetchUserRole, updateAuthState]);

  // Auth state change listener
  useEffect(() => {
    console.log('🎧 Setting up auth listener');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await initializeAuth(session?.user || null);
      } catch (error) {
        console.error('Error getting initial session:', error);
        updateAuthState({ isLoading: false, error: 'Failed to initialize authentication' });
      }
    };

    getInitialSession();

    // Emergency timeout to prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      if (authState.isLoading) {
        console.log('🚨 Emergency timeout - forcing auth completion');
        updateAuthState({
          isLoading: false,
          error: 'Authentication timeout - please refresh the page'
        });
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
      
      await initializeAuth(session?.user || null);
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      subscription.unsubscribe();
      clearTimeout(emergencyTimeout);
    };
  }, []); // Empty dependency array - this should only run once

  // Memoized action functions
  const signOut = useCallback(async () => {
    console.log('👋 Signing out');
    updateAuthState({ isLoading: true });
    
    try {
      await supabase.auth.signOut();
      // State will be updated by the auth listener
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      updateAuthState({
        isLoading: false,
        error: `Sign out failed: ${error.message}`
      });
    }
  }, [updateAuthState]);

  const clearError = useCallback(() => {
    updateAuthState({ error: null });
  }, [updateAuthState]);

  const refreshAuth = useCallback(async () => {
    console.log('🔄 Refreshing auth state');
    const { data: { session } } = await supabase.auth.getSession();
    isInitialized.current = false;
    await initializeAuth(session?.user || null);
  }, [initializeAuth]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...authState,
    signOut,
    clearError,
    refreshAuth
  }), [authState, signOut, clearError, refreshAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SafeAuthProvider');
  }
  return context;
};

// Debug component to monitor auth state
export const AuthDebugger: React.FC = () => {
  const auth = useAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      fontFamily: 'monospace'
    }}>
      <div>Auth Status: {auth.isAuthenticated ? '✅' : '❌'}</div>
      <div>Loading: {auth.isLoading ? '⏳' : '✅'}</div>
      <div>Role: {auth.role || 'none'}</div>
      <div>User: {auth.user?.email || 'none'}</div>
      {auth.error && <div style={{ color: '#ff6b6b' }}>Error: {auth.error}</div>}
    </div>
  );
};
