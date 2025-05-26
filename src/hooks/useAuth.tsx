
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

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('=== FETCHING ROLE FOR USER ===', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Role fetch timeout')), 10000);
      });

      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('=== ERROR FETCHING USER ROLE ===', error);
        return 'read-only' as UserRole;
      }

      console.log('=== USER ROLES DATA ===', data);

      if (data && data.length > 0) {
        const roleHierarchy: UserRole[] = ['super-admin', 'publish', 'edit', 'read-only'];
        
        for (const hierarchyRole of roleHierarchy) {
          const foundRole = data.find(item => item.role === hierarchyRole);
          if (foundRole) {
            console.log('=== FOUND ROLE ===', foundRole.role);
            return foundRole.role as UserRole;
          }
        }
        
        return data[0].role as UserRole;
      }

      console.log('=== NO ROLE FOUND, DEFAULTING TO READ-ONLY ===');
      return 'read-only' as UserRole;
    } catch (error) {
      console.error('=== ERROR IN FETCH USER ROLE ===', error);
      return 'read-only' as UserRole;
    }
  };

  useEffect(() => {
    console.log('=== AUTH PROVIDER USEEFFECT STARTING ===');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event, session?.user?.email);
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
        } else {
          console.log('=== NO USER, CLEARING STATE ===');
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // Get initial session with timeout
    const initAuth = async () => {
      try {
        console.log('=== GETTING INITIAL SESSION ===');
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Initial session timeout')), 5000);
        });

        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        console.log('=== INITIAL SESSION ===', session?.user?.email);
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const role = await fetchUserRole(session.user.id);
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
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
