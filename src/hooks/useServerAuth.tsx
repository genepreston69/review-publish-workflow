
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const callAuthService = async (action: string, data?: any) => {
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
  };

  const initializeAuth = async () => {
    console.log('=== INITIALIZING SERVER AUTH ===');
    setIsLoading(true);

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
    }
  };

  useEffect(() => {
    console.log('=== SERVER AUTH PROVIDER STARTING ===');
    
    // Initialize auth state
    initializeAuth();

    // Set up auth state listener (simplified)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event);
        
        if (event === 'SIGNED_OUT') {
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

    return () => {
      console.log('=== CLEANING UP SERVER AUTH ===');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('=== SIGNING OUT (SERVER) ===');
    try {
      // Call server-side sign out
      await callAuthService('signOut', { 
        token: session?.access_token 
      });

      // Clear local state
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
  };

  console.log('=== SERVER AUTH PROVIDER RENDER ===', { 
    currentUser: !!currentUser, 
    userRole, 
    isLoading 
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
