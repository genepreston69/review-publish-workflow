
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
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      console.log('=== FETCHING ROLE FOR USER ===', userId, new Date().toISOString());
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: false })
        .limit(1);

      if (error) {
        console.error('=== ERROR FETCHING USER ROLE ===', error);
        return 'read-only';
      }

      console.log('=== USER ROLES DATA ===', data, new Date().toISOString());

      if (data && data.length > 0) {
        const role = data[0].role as UserRole;
        console.log('=== FOUND ROLE ===', role, new Date().toISOString());
        return role;
      }

      console.log('=== NO ROLE FOUND, DEFAULTING TO READ-ONLY ===', new Date().toISOString());
      return 'read-only';
    } catch (error) {
      console.error('=== ERROR IN FETCH USER ROLE ===', error);
      return 'read-only';
    }
  };

  useEffect(() => {
    console.log('=== AUTH PROVIDER INITIALIZATION ===', new Date().toISOString());
    
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('=== INITIAL SESSION ERROR ===', error);
          if (isMounted) {
            setIsLoading(false);
            setIsInitialized(true);
          }
          return;
        }

        console.log('=== INITIAL SESSION ===', initialSession?.user?.email, new Date().toISOString());
        
        if (isMounted) {
          setSession(initialSession);
          setCurrentUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            console.log('=== FETCHING INITIAL ROLE ===', initialSession.user.id);
            const role = await fetchUserRole(initialSession.user.id);
            if (isMounted) {
              setUserRole(role);
              console.log('=== INITIAL ROLE SET ===', role);
            }
          }
          
          setIsLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('=== AUTH INITIALIZATION ERROR ===', error);
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event, session?.user?.email, new Date().toISOString());
        
        if (!isMounted) return;
        
        // Only handle auth changes after initial setup is complete
        if (!isInitialized && event !== 'INITIAL_SESSION') {
          return;
        }
        
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          console.log('=== USER SIGNED IN, FETCHING ROLE ===');
          try {
            const role = await fetchUserRole(session.user.id);
            if (isMounted) {
              setUserRole(role);
              console.log('=== SIGN IN ROLE SET ===', role);
            }
          } catch (error) {
            console.error('=== ERROR FETCHING ROLE ON SIGN IN ===', error);
            if (isMounted) {
              setUserRole('read-only');
            }
          }
        } else if (!session?.user) {
          console.log('=== NO USER, CLEARING STATE ===');
          setUserRole(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('=== SIGNING OUT ===');
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setIsLoading(false);
  };

  console.log('=== AUTH PROVIDER RENDER ===', { 
    currentUser: !!currentUser, 
    userRole, 
    isLoading, 
    isInitialized,
    timestamp: new Date().toISOString()
  });

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
