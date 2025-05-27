
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
  const [isFetchingRole, setIsFetchingRole] = useState(false);

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

  const updateUserRole = async (userId: string) => {
    // Prevent concurrent role fetches
    if (isFetchingRole) {
      console.log('=== ROLE FETCH ALREADY IN PROGRESS, SKIPPING ===');
      return;
    }

    try {
      setIsFetchingRole(true);
      console.log('=== STARTING ROLE FETCH ===', userId, new Date().toISOString());
      
      const role = await fetchUserRole(userId);
      console.log('=== ROLE FETCH COMPLETE ===', role, new Date().toISOString());
      setUserRole(role);
    } catch (error) {
      console.error('=== ROLE FETCH FAILED ===', error);
      setUserRole('read-only');
    } finally {
      setIsFetchingRole(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== AUTH PROVIDER USEEFFECT STARTING ===', new Date().toISOString());
    
    let initialSessionProcessed = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event, session?.user?.email, new Date().toISOString());
        
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          // Only fetch role if we haven't processed the initial session yet
          // or if this is a new session (sign in event)
          if (!initialSessionProcessed || event === 'SIGNED_IN') {
            console.log('=== USER FOUND, UPDATING ROLE ===', event);
            await updateUserRole(session.user.id);
            initialSessionProcessed = true;
          }
        } else {
          console.log('=== NO USER, CLEARING STATE ===');
          setUserRole(null);
          setIsLoading(false);
          setIsFetchingRole(false);
        }
      }
    );

    // Get initial session
    const initAuth = async () => {
      try {
        console.log('=== GETTING INITIAL SESSION ===', new Date().toISOString());
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('=== INITIAL SESSION ERROR ===', error);
          setIsLoading(false);
          return;
        }
        
        console.log('=== INITIAL SESSION ===', session?.user?.email, new Date().toISOString());
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          await updateUserRole(session.user.id);
          initialSessionProcessed = true;
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('=== INITIAL AUTH ERROR ===', error);
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

  console.log('=== AUTH PROVIDER RENDER ===', { 
    currentUser: !!currentUser, 
    userRole, 
    isLoading, 
    isFetchingRole,
    timestamp: new Date().toISOString()
  });

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      session, 
      userRole, 
      isLoading: isLoading || isFetchingRole, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
