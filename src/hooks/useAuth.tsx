
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

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    console.log('=== FETCHING ROLE FOR USER ===', userId);
    
    try {
      // Use a more direct query with better error handling
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to handle case where no row exists

      if (error) {
        console.error('=== ERROR FETCHING USER ROLE ===', error);
        // If it's a connection error, throw to trigger retry
        if (error.message?.includes('Failed to fetch') || error.code === 'PGRST301') {
          throw error;
        }
        // For other errors, return default role
        console.log('=== USING DEFAULT ROLE DUE TO ERROR ===');
        return 'read-only';
      }

      if (!data) {
        console.log('=== NO PROFILE FOUND, CREATING DEFAULT PROFILE ===');
        // Try to create a profile for this user
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              name: 'New User',
              email: session?.user?.email || '',
              role: 'read-only'
            });
          
          if (insertError) {
            console.error('=== ERROR CREATING PROFILE ===', insertError);
          }
        } catch (insertErr) {
          console.error('=== PROFILE CREATION FAILED ===', insertErr);
        }
        
        return 'read-only';
      }

      console.log('=== USER ROLE DATA ===', data);
      const role = data.role as UserRole || 'read-only';
      console.log('=== FOUND ROLE ===', role);
      return role;
    } catch (error) {
      console.error('=== ERROR IN FETCH USER ROLE ===', error);
      throw error;
    }
  };

  const initializeAuth = async (session: Session | null) => {
    console.log('=== INITIALIZING AUTH ===', session?.user?.email);
    
    if (!session?.user) {
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    setSession(session);
    setCurrentUser(session.user);

    // Try to fetch role with retries and timeout
    let attempts = 0;
    const maxAttempts = 3;
    const attemptDelay = 1000; // 1 second between attempts

    while (attempts < maxAttempts) {
      try {
        console.log(`=== ROLE FETCH ATTEMPT ${attempts + 1}/${maxAttempts} ===`);
        
        // Create a promise that races against timeout
        const rolePromise = fetchUserRole(session.user.id);
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Role fetch timeout')), 5000)
        );

        const role = await Promise.race([rolePromise, timeoutPromise]);
        setUserRole(role);
        setIsLoading(false);
        console.log('=== AUTH INITIALIZATION SUCCESSFUL ===', role);
        return;

      } catch (error: any) {
        attempts++;
        console.error(`=== ROLE FETCH ATTEMPT ${attempts} FAILED ===`, error.message);
        
        if (attempts >= maxAttempts) {
          console.log('=== MAX ATTEMPTS REACHED, USING DEFAULT ROLE ===');
          setUserRole('read-only');
          setIsLoading(false);
          return;
        }
        
        // Wait before next attempt
        if (attempts < maxAttempts) {
          console.log(`=== WAITING ${attemptDelay}ms BEFORE RETRY ===`);
          await new Promise(resolve => setTimeout(resolve, attemptDelay));
        }
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
          await initializeAuth(session);
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
