
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
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('=== ERROR FETCHING USER ROLE ===', error);
        // If there's a database error, default to readonly
        return 'readonly';
      }

      console.log('=== USER ROLE DATA ===', data);

      if (data && data.role) {
        const role = data.role as UserRole;
        console.log('=== FOUND ROLE ===', role);
        return role;
      }

      console.log('=== NO ROLE FOUND, DEFAULTING TO READONLY ===');
      return 'readonly';
    } catch (error) {
      console.error('=== ERROR IN FETCH USER ROLE ===', error);
      return 'readonly';
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
            setUserRole('readonly');
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
            setUserRole('readonly');
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
