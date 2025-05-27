
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
            setSession(null);
            setCurrentUser(null);
            setUserRole(null);
            setIsLoading(false);
          }
          return;
        }

        console.log('=== INITIAL SESSION ===', initialSession?.user?.email, new Date().toISOString());
        
        if (isMounted) {
          setSession(initialSession);
          setCurrentUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            console.log('=== FETCHING INITIAL ROLE ===', initialSession.user.id);
            try {
              const role = await fetchUserRole(initialSession.user.id);
              if (isMounted) {
                setUserRole(role);
                console.log('=== INITIAL ROLE SET ===', role);
              }
            } catch (roleError) {
              console.error('=== ERROR FETCHING INITIAL ROLE ===', roleError);
              if (isMounted) {
                setUserRole('read-only');
              }
            }
          } else {
            setUserRole(null);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('=== AUTH INITIALIZATION ERROR ===', error);
        if (isMounted) {
          setSession(null);
          setCurrentUser(null);
          setUserRole(null);
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event, session?.user?.email, new Date().toISOString());
        
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('=== USER SIGNED OUT OR NO SESSION, CLEARING STATE ===');
          setSession(null);
          setCurrentUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }
        
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log('=== USER SIGNED IN OR TOKEN REFRESHED, FETCHING ROLE ===');
          try {
            const role = await fetchUserRole(session.user.id);
            if (isMounted) {
              setUserRole(role);
              console.log('=== ROLE SET FROM AUTH STATE CHANGE ===', role);
            }
          } catch (error) {
            console.error('=== ERROR FETCHING ROLE ON AUTH STATE CHANGE ===', error);
            if (isMounted) {
              setUserRole('read-only');
            }
          }
        }
        
        setIsLoading(false);
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
    console.log('=== SIGNING OUT ===', new Date().toISOString());
    setIsLoading(true);
    
    try {
      // Clear local state immediately
      setSession(null);
      setCurrentUser(null);
      setUserRole(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('=== SIGN OUT SUCCESSFUL ===', new Date().toISOString());
      }
    } catch (error) {
      console.error('=== SIGN OUT ERROR ===', error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('=== AUTH PROVIDER RENDER ===', { 
    currentUser: !!currentUser, 
    userRole, 
    isLoading,
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
