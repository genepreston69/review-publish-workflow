
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { AuthContext } from './AuthContext';
import { AuthProviderProps } from './types';
import { fetchUserRole, signOutUser } from './authService';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('=== AUTH PROVIDER USEEFFECT STARTING ===');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('=== USER SIGNED OUT OR NO SESSION ===');
          setSession(null);
          setCurrentUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }
        
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('=== USER FOUND, FETCHING ROLE ===');
          // Use setTimeout to prevent blocking the auth state change
          setTimeout(async () => {
            try {
              const role = await fetchUserRole(session.user.id);
              console.log('=== ROLE FETCHED, SETTING STATE ===', role);
              setUserRole(role);
            } catch (error) {
              console.error('=== ROLE FETCH FAILED ===', error);
              setUserRole('read-only');
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          setIsLoading(false);
        }
      }
    );

    // Get initial session with timeout
    const initAuth = async () => {
      try {
        console.log('=== GETTING INITIAL SESSION ===');
        
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
        );
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error('=== INITIAL SESSION ERROR ===', error);
          setIsLoading(false);
          return;
        }
        
        console.log('=== INITIAL SESSION ===', session?.user?.email);
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const role = await fetchUserRole(session.user.id);
            console.log('=== INITIAL ROLE FETCHED, SETTING STATE ===', role);
            setUserRole(role);
          } catch (error) {
            console.error('=== INITIAL ROLE FETCH FAILED ===', error);
            setUserRole('read-only');
          }
        }
      } catch (error) {
        console.error('=== INITIAL AUTH ERROR ===', error);
        // Set defaults on timeout/error
        setSession(null);
        setCurrentUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      console.log('=== CLEANING UP AUTH SUBSCRIPTION ===');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setSession(null);
    setCurrentUser(null);
    setUserRole(null);
    
    await signOutUser();
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
