
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
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('=== ERROR FETCHING USER ROLE ===', error);
        return 'read-only';
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

    try {
      const role = await fetchUserRole(session.user.id);
      setUserRole(role);
    } catch (error) {
      console.error('=== ROLE FETCH FAILED ===', error);
      setUserRole('read-only');
    } finally {
      setIsLoading(false);
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
