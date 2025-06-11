
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;
  const ROLE_FETCH_TIMEOUT = 10000; // 10 seconds

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    return new Promise(async (resolve, reject) => {
      console.log('=== FETCHING ROLE FOR USER ===', userId);
      console.log('=== RETRY COUNT ===', retryCount);
      
      // Check retry limit
      if (retryCount >= MAX_RETRIES) {
        console.log('=== MAX RETRIES REACHED, DEFAULTING TO READ-ONLY ===');
        resolve('read-only');
        return;
      }

      const timeoutId = setTimeout(() => {
        console.log('=== ROLE FETCH TIMEOUT ===');
        reject(new Error('Role fetch timeout'));
      }, ROLE_FETCH_TIMEOUT);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        clearTimeout(timeoutId);

        if (error) {
          console.error('=== ERROR FETCHING USER ROLE ===', error);
          throw error;
        }

        console.log('=== USER ROLE DATA ===', data);
        const role = data?.role as UserRole || 'read-only';
        console.log('=== FOUND ROLE ===', role);
        resolve(role);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('=== ERROR IN FETCH USER ROLE ===', error);
        reject(error);
      }
    });
  };

  const initializeAuth = async (session: Session | null) => {
    console.log('=== INITIALIZING AUTH ===', session?.user?.email);
    
    if (!session?.user) {
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      setIsLoading(false);
      setRetryCount(0);
      return;
    }

    setSession(session);
    setCurrentUser(session.user);

    try {
      const role = await fetchUserRole(session.user.id);
      setUserRole(role);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('=== ROLE FETCH FAILED ===', error);
      setRetryCount(prev => prev + 1);
      
      // If we've hit max retries, set default role and stop loading
      if (retryCount >= MAX_RETRIES - 1) {
        console.log('=== SETTING DEFAULT ROLE AFTER MAX RETRIES ===');
        setUserRole('read-only');
      } else {
        // Retry after a delay
        setTimeout(() => {
          console.log('=== RETRYING ROLE FETCH ===');
          initializeAuth(session);
        }, 2000 * (retryCount + 1)); // Exponential backoff
        return; // Don't set loading to false yet
      }
    } finally {
      // Only set loading to false if we're not retrying
      if (retryCount >= MAX_RETRIES - 1) {
        setIsLoading(false);
      }
    }
  };

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
          await initializeAuth(session);
        }
      } catch (error) {
        console.error('=== INITIAL AUTH ERROR ===', error);
        if (mounted) {
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
          setRetryCount(0);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await initializeAuth(session);
        }
      }
    );

    getInitialSession();

    return () => {
      console.log('=== CLEANING UP AUTH SUBSCRIPTION ===');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Emergency timeout to prevent infinite loading
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('=== EMERGENCY TIMEOUT - FORCING LOADING TO FALSE ===');
        setIsLoading(false);
        if (currentUser && !userRole) {
          console.log('=== SETTING EMERGENCY DEFAULT ROLE ===');
          setUserRole('read-only');
        }
      }
    }, 30000); // 30 seconds emergency timeout

    return () => clearTimeout(emergencyTimeout);
  }, [isLoading, currentUser, userRole]);

  const signOut = async () => {
    console.log('=== SIGNING OUT ===');
    try {
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      setRetryCount(0);
      
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

  console.log('=== AUTH PROVIDER RENDER ===', { currentUser: !!currentUser, userRole, isLoading, retryCount });

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
