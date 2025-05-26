
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
      console.log('Fetching role for user:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: false }); // Get highest privilege role first

      if (error) {
        console.error('Error fetching user role:', error);
        // If there's an error fetching the role, default to read-only
        return 'read-only' as UserRole;
      }

      console.log('User roles data:', data);

      // If user has multiple roles, prioritize super-admin > publish > edit > read-only
      if (data && data.length > 0) {
        const roleHierarchy: UserRole[] = ['super-admin', 'publish', 'edit', 'read-only'];
        
        for (const hierarchyRole of roleHierarchy) {
          const foundRole = data.find(item => item.role === hierarchyRole);
          if (foundRole) {
            console.log('Found role:', foundRole.role);
            return foundRole.role as UserRole;
          }
        }
        
        // Fallback to first role if none match hierarchy
        return data[0].role as UserRole;
      }

      // If no role found, default to read-only
      console.log('No role found, defaulting to read-only');
      return 'read-only' as UserRole;
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Default to read-only on any error
      return 'read-only' as UserRole;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role after setting user
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
          setIsLoading(false);
        } else {
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUserRole(role);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

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
