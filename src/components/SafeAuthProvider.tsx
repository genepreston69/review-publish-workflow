
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SafeAuthProvider');
  }
  return context;
};

interface SafeAuthProviderProps {
  children: React.ReactNode;
}

// Emergency timeout for auth operations
const AUTH_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

export const SafeAuthProvider: React.FC<SafeAuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent multiple simultaneous auth operations
  const authOperationRef = useRef(false);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Safe async operation wrapper with timeout and retry
  const safeAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    retries: number = MAX_RETRIES
  ): Promise<T | null> => {
    if (!mountedRef.current) return null;

    try {
      console.log(`=== STARTING ${operationName} ===`);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`${operationName} timeout`)), AUTH_TIMEOUT);
      });

      const result = await Promise.race([operation(), timeoutPromise]);
      console.log(`=== ${operationName} SUCCESS ===`);
      return result;
    } catch (error) {
      console.error(`=== ${operationName} ERROR ===`, error);
      
      if (retries > 0 && mountedRef.current) {
        console.log(`=== RETRYING ${operationName} (${retries} attempts left) ===`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return safeAsyncOperation(operation, operationName, retries - 1);
      }
      
      return null;
    }
  }, []);

  // Safe role fetching with fallback
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    const operation = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Role fetch error:', error);
        return 'read-only';
      }

      if (data && data.length > 0) {
        return data[0].role as UserRole;
      }

      return 'read-only';
    };

    const result = await safeAsyncOperation(operation, 'FETCH_USER_ROLE');
    return result || 'read-only';
  }, [safeAsyncOperation]);

  // Safe session initialization
  const initializeAuth = useCallback(async () => {
    if (authOperationRef.current || !mountedRef.current) return;
    
    authOperationRef.current = true;
    console.log('=== INITIALIZING AUTH ===');

    try {
      const operation = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
      };

      const initialSession = await safeAsyncOperation(operation, 'GET_INITIAL_SESSION');
      
      if (!mountedRef.current) return;

      if (initialSession?.user) {
        setSession(initialSession);
        setCurrentUser(initialSession.user);
        
        const role = await fetchUserRole(initialSession.user.id);
        if (mountedRef.current) {
          setUserRole(role);
        }
      } else {
        setSession(null);
        setCurrentUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('=== AUTH INITIALIZATION ERROR ===', error);
      if (mountedRef.current) {
        setError('Authentication initialization failed');
        setSession(null);
        setCurrentUser(null);
        setUserRole(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        authOperationRef.current = false;
      }
    }
  }, [safeAsyncOperation, fetchUserRole]);

  // Safe auth state change handler
  const handleAuthStateChange = useCallback(async (event: string, newSession: Session | null) => {
    if (!mountedRef.current) return;
    
    console.log('=== AUTH STATE CHANGE ===', event, newSession?.user?.email);

    // Handle sign out immediately
    if (event === 'SIGNED_OUT' || !newSession) {
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      setError(null);
      return;
    }

    // Handle sign in
    if (newSession?.user) {
      setSession(newSession);
      setCurrentUser(newSession.user);
      setError(null);
      
      // Fetch role with safety measures
      try {
        const role = await fetchUserRole(newSession.user.id);
        if (mountedRef.current) {
          setUserRole(role);
        }
      } catch (error) {
        console.error('=== ROLE FETCH FAILED IN STATE CHANGE ===', error);
        if (mountedRef.current) {
          setUserRole('read-only'); // Safe fallback
        }
      }
    }
  }, [fetchUserRole]);

  // Setup auth listener and initialize
  useEffect(() => {
    console.log('=== SETTING UP AUTH LISTENER ===');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    // Initialize auth state
    initializeAuth();

    return () => {
      console.log('=== CLEANING UP AUTH SUBSCRIPTION ===');
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, initializeAuth]);

  // Safe sign out
  const signOut = useCallback(async () => {
    console.log('=== SIGNING OUT ===');
    
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
    } catch (error) {
      console.error('=== UNEXPECTED SIGN OUT ERROR ===', error);
      // Local state is already cleared, so this is fine
    }
  }, []);

  // Manual refetch function
  const refetch = useCallback(async () => {
    if (currentUser) {
      const role = await fetchUserRole(currentUser.id);
      if (mountedRef.current) {
        setUserRole(role);
      }
    }
  }, [currentUser, fetchUserRole]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentUser,
    session,
    userRole,
    isLoading,
    error,
    signOut,
    refetch
  }), [currentUser, session, userRole, isLoading, error, signOut, refetch]);

  console.log('=== SAFE AUTH PROVIDER RENDER ===', { 
    currentUser: !!currentUser, 
    userRole, 
    isLoading, 
    error 
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
