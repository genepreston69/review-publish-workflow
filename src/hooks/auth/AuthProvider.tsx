
import { useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { AuthContext } from './AuthContext';
import { initializeAuth } from './authInitializationService';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('=== AUTH PROVIDER USEEFFECT STARTING ===');
    
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('=== INITIAL SESSION ERROR ===', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }
        
        if (mounted) {
          await initializeAuth(session, setSession, setCurrentUser, setUserRole, setIsLoading);
        }
      } catch (error) {
        console.error('=== INITIAL AUTH ERROR ===', error);
        if (mounted) {
          setUserRole('read-only');
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event, session?.user?.email);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setCurrentUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await initializeAuth(session, setSession, setCurrentUser, setUserRole, setIsLoading);
        }
      }
    );

    getInitialSession();

    // Emergency timeout to prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.log('=== EMERGENCY TIMEOUT - FORCING LOADING TO FALSE ===');
        setIsLoading(false);
        if (currentUser && !userRole) {
          console.log('=== SETTING EMERGENCY DEFAULT ROLE ===');
          setUserRole('read-only');
        }
      }
    }, 15000); // 15 seconds emergency timeout

    return () => {
      console.log('=== CLEANING UP AUTH SUBSCRIPTION ===');
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(emergencyTimeout);
    };
  }, []);

  const signOut = async () => {
    console.log('=== SIGNING OUT ===');
    try {
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('=== SIGN OUT SUCCESSFUL ===');
      }
    } catch (error) {
      console.error('=== UNEXPECTED SIGN OUT ERROR ===', error);
    }
  };

  console.log('=== AUTH PROVIDER RENDER ===', { currentUser: !!currentUser, userRole, isLoading });

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      session, 
      userRole, 
      isLoading, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
