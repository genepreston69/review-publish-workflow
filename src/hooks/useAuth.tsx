import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { authConfig } from '@/config/authConfig';

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
      console.log('=== FETCHING ROLE FOR USER FROM PROFILES ===', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('=== ERROR FETCHING USER ROLE FROM PROFILES ===', error);
        
        // If no profile exists, create one with default role
        if (error.code === 'PGRST116') {
          console.log('=== NO PROFILE FOUND, CREATING DEFAULT PROFILE ===');
          
          // Get user info from auth
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                name: userData.user.user_metadata?.name || userData.user.email || 'Unknown User',
                email: userData.user.email || '',
                role: 'read-only'
              });
            
            if (insertError) {
              console.error('=== ERROR CREATING PROFILE ===', insertError);
            } else {
              console.log('=== PROFILE CREATED WITH READ-ONLY ROLE ===');
              return 'read-only';
            }
          }
        }
        
        return 'read-only';
      }

      console.log('=== USER PROFILE DATA FROM PROFILES ===', data);

      if (data && data.role) {
        const role = data.role as UserRole;
        console.log('=== FOUND ROLE IN PROFILES ===', role);
        return role;
      }

      console.log('=== NO ROLE FOUND IN PROFILES, DEFAULTING TO READ-ONLY ===');
      return 'read-only';
    } catch (error) {
      console.error('=== ERROR IN FETCH USER ROLE FROM PROFILES ===', error);
      return 'read-only';
    }
  };

  useEffect(() => {
    console.log('=== AUTH PROVIDER USEEFFECT STARTING ===');
    
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
          console.log('=== USER FOUND, FETCHING ROLE FROM PROFILES ===');
          try {
            const rolePromise = fetchUserRole(session.user.id);
            const timeoutPromise = new Promise<UserRole>((_, reject) => {
              setTimeout(() => reject(new Error('Role fetch timeout')), 10000);
            });

            const role = await Promise.race([rolePromise, timeoutPromise]);
            console.log('=== ROLE FETCHED FROM PROFILES ===', role);
            setUserRole(role);
          } catch (error) {
            console.error('=== ROLE FETCH FROM PROFILES FAILED ===', error);
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
            const rolePromise = fetchUserRole(session.user.id);
            const timeoutPromise = new Promise<UserRole>((_, reject) => {
              setTimeout(() => reject(new Error('Initial role fetch timeout')), 10000);
            });

            const role = await Promise.race([rolePromise, timeoutPromise]);
            console.log('=== INITIAL ROLE FETCHED FROM PROFILES ===', role);
            setUserRole(role);
          } catch (error) {
            console.error('=== INITIAL ROLE FETCH FROM PROFILES FAILED ===', error);
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
