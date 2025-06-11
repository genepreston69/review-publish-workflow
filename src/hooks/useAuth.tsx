
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
    try {
      console.log('=== FETCHING ROLE FOR USER ===', userId);
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Role fetch timeout')), 5000);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      const result = await Promise.race([fetchPromise, timeoutPromise]);
      const { data, error } = result;

      if (error) {
        console.error('=== ERROR FETCHING USER ROLE ===', error);
        // If profile doesn't exist, return default role
        if (error.code === 'PGRST116') {
          console.log('=== PROFILE NOT FOUND, RETURNING DEFAULT ROLE ===');
          return 'read-only';
        }
        throw error;
      }

      console.log('=== USER ROLE DATA ===', data);
      const role = data?.role as UserRole || 'read-only';
      console.log('=== FOUND ROLE ===', role);
      return role;
    } catch (error) {
      console.error('=== ERROR IN FETCH USER ROLE ===', error);
      return 'read-only';
    }
  };

  useEffect(() => {
    console.log('=== AUTH PROVIDER USEEFFECT STARTING ===');
    
    let mounted = true;
    
    // Get initial session
    const initAuth = async () => {
      try {
        console.log('=== GETTING INITIAL SESSION ===');
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('=== INITIAL SESSION ERROR ===', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }
        
        console.log('=== INITIAL SESSION ===', initialSession?.user?.email);
        
        if (initialSession?.user && mounted) {
          setSession(initialSession);
          setCurrentUser(initialSession.user);
          
          try {
            const role = await fetchUserRole(initialSession.user.id);
            console.log('=== INITIAL ROLE FETCHED ===', role);
            if (mounted) {
              setUserRole(role);
            }
          } catch (error) {
            console.error('=== INITIAL ROLE FETCH FAILED ===', error);
            if (mounted) {
              setUserRole('read-only');
            }
          }
        } else if (mounted) {
          setSession(null);
          setCurrentUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('=== INITIAL AUTH ERROR ===', error);
        if (mounted) {
          setUserRole('read-only');
        }
      } finally {
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
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('=== USER SIGNED OUT OR NO SESSION ===');
          setSession(null);
          setCurrentUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          setCurrentUser(session.user);
          
          console.log('=== USER FOUND, FETCHING ROLE ===');
          
          // Use setTimeout to prevent blocking the auth state change
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const role = await fetchUserRole(session.user.id);
              console.log('=== ROLE FETCHED ===', role);
              if (mounted) {
                setUserRole(role);
                setIsLoading(false);
              }
            } catch (error) {
              console.error('=== ROLE FETCH FAILED ===', error);
              if (mounted) {
                setUserRole('read-only');
                setIsLoading(false);
              }
            }
          }, 0);
        }
      }
    );

    initAuth();

    return () => {
      console.log('=== CLEANING UP AUTH SUBSCRIPTION ===');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('=== SIGNING OUT ===');
    try {
      // Clear local state first to provide immediate feedback
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('=== SIGN OUT SUCCESSFUL ===');
      }
    } catch (error) {
      console.error('=== UNEXPECTED SIGN OUT ERROR ===', error);
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
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
