
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
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('=== ERROR FETCHING USER ROLE ===', error);
        return 'read-only';
      }

      console.log('=== USER ROLES DATA ===', data);

      if (data && data.length > 0) {
        // Get the highest priority role if multiple exist
        const rolePriority = {
          'super-admin': 4,
          'publish': 3,
          'edit': 2,
          'read-only': 1
        };
        
        const highestRole = data.reduce((highest, current) => {
          const currentPriority = rolePriority[current.role as UserRole] || 0;
          const highestPriority = rolePriority[highest.role as UserRole] || 0;
          return currentPriority > highestPriority ? current : highest;
        });
        
        const role = highestRole.role as UserRole;
        console.log('=== FOUND ROLE ===', role);
        return role;
      }

      console.log('=== NO ROLE FOUND, DEFAULTING TO READ-ONLY ===');
      return 'read-only';
    } catch (error) {
      console.error('=== ERROR IN FETCH USER ROLE ===', error);
      return 'read-only';
    }
  };

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
          try {
            const role = await fetchUserRole(session.user.id);
            console.log('=== ROLE FETCHED ===', role);
            setUserRole(role);
          } catch (error) {
            console.error('=== ROLE FETCH FAILED ===', error);
            setUserRole('read-only');
          } finally {
            setIsLoading(false);
          }
        }
      }
    );

    // Get initial session
    const initAuth = async () => {
      try {
        console.log('=== GETTING INITIAL SESSION ===');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
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
            console.log('=== INITIAL ROLE FETCHED ===', role);
            setUserRole(role);
          } catch (error) {
            console.error('=== INITIAL ROLE FETCH FAILED ===', error);
            setUserRole('read-only');
          }
        }
      } catch (error) {
        console.error('=== INITIAL AUTH ERROR ===', error);
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
        // Even if there's an error, we want to clear the local state
        // This handles cases where the session might already be expired
      } else {
        console.log('=== SIGN OUT SUCCESSFUL ===');
      }
    } catch (error) {
      console.error('=== UNEXPECTED SIGN OUT ERROR ===', error);
      // Clear local state even on unexpected errors
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
