
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

interface ServerAuthContextType {
  currentUser: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const ServerAuthContext = createContext<ServerAuthContextType | undefined>(undefined);

export const useServerAuth = () => {
  const context = useContext(ServerAuthContext);
  if (!context) {
    throw new Error('useServerAuth must be used within a ServerAuthProvider');
  }
  return context;
};

interface ServerAuthProviderProps {
  children: ReactNode;
}

export const ServerAuthProvider = ({ children }: ServerAuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Emergency render counter to prevent infinite loops
  const renderCountRef = useRef(0);
  const isInitializingRef = useRef(false);
  const lastSessionIdRef = useRef<string | null>(null);

  const callAuthService = useCallback(async (action: string, data?: any) => {
    try {
      const response = await supabase.functions.invoke('auth-service', {
        body: { action, ...data }
      });

      if (response.error) {
        console.error('=== AUTH SERVICE ERROR ===', response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('=== AUTH SERVICE CALL ERROR ===', error);
      return null;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (isInitializingRef.current) {
      console.log('=== SKIPPING INIT - ALREADY INITIALIZING ===');
      return;
    }

    // Emergency render loop protection
    renderCountRef.current += 1;
    if (renderCountRef.current > 50) {
      console.error('=== EMERGENCY: TOO MANY AUTH RENDERS, STOPPING ===');
      setIsLoading(false);
      return;
    }

    isInitializingRef.current = true;
    console.log('=== INITIALIZING SERVER AUTH ===', renderCountRef.current);

    try {
      // Get current session from Supabase
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('=== SESSION ERROR ===', error);
        setSession(null);
        setCurrentUser(null);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      // Check if session actually changed to prevent unnecessary updates
      const currentSessionId = currentSession?.access_token || null;
      if (lastSessionIdRef.current === currentSessionId) {
        console.log('=== SESSION UNCHANGED, SKIPPING UPDATE ===');
        setIsLoading(false);
        return;
      }
      lastSessionIdRef.current = currentSessionId;

      if (!currentSession?.access_token) {
        console.log('=== NO SESSION FOUND ===');
        setSession(null);
        setCurrentUser(null);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      // Validate session and get user role from server
      const authData = await callAuthService('getSession', { 
        token: currentSession.access_token 
      });

      if (authData && authData.user) {
        console.log('=== SERVER AUTH SUCCESS ===', authData.userRole);
        setSession(authData.session);
        setCurrentUser(authData.user);
        setUserRole(authData.userRole);
      } else {
        console.log('=== SERVER AUTH FAILED ===');
        setSession(null);
        setCurrentUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('=== INIT AUTH ERROR ===', error);
      setSession(null);
      setCurrentUser(null);
      setUserRole('read-only');
    } finally {
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }, [callAuthService]);

  useEffect(() => {
    console.log('=== SERVER AUTH PROVIDER STARTING ===');
    
    // Reset render counter on mount
    renderCountRef.current = 0;
    
    // Initialize auth state
    initializeAuth();

    // Set up auth state listener with protection against loops
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event);
        
        // Prevent rapid state changes
        if (isInitializingRef.current) {
          console.log('=== SKIPPING STATE CHANGE - ALREADY INITIALIZING ===');
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          lastSessionIdRef.current = null;
          setSession(null);
          setCurrentUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Re-initialize with new session
          await initializeAuth();
        }
      }
    );

    // Emergency timeout to prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('=== EMERGENCY TIMEOUT - FORCING LOADING TO FALSE ===');
        setIsLoading(false);
        if (currentUser && !userRole) {
          setUserRole('read-only');
        }
      }
    }, 10000); // 10 seconds emergency timeout

    return () => {
      console.log('=== CLEANING UP SERVER AUTH ===');
      subscription.unsubscribe();
      clearTimeout(emergencyTimeout);
      isInitializingRef.current = false;
    };
  }, []); // Empty dependency array to prevent re-initialization

  const signOut = useCallback(async () => {
    console.log('=== SIGNING OUT (SERVER) ===');
    try {
      // Call server-side sign out
      await callAuthService('signOut', { 
        token: session?.access_token 
      });

      // Clear local state
      lastSessionIdRef.current = null;
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      
      // Sign out from Supabase client
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Client sign out error:', error);
      } else {
        console.log('=== SIGN OUT SUCCESSFUL ===');
      }
    } catch (error) {
      console.error('=== SIGN OUT ERROR ===', error);
    }
  }, [session?.access_token, callAuthService]);

  console.log('=== SERVER AUTH PROVIDER RENDER ===', { 
    currentUser: !!currentUser, 
    userRole, 
    isLoading,
    renderCount: renderCountRef.current
  });

  return (
    <ServerAuthContext.Provider value={{ 
      currentUser, 
      session, 
      userRole, 
      isLoading, 
      signOut 
    }}>
      {children}
    </ServerAuthContext.Provider>
  );
};
