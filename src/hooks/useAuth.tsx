
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      console.log('=== FETCHING USER ROLE FOR USER ===', userId);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 10000); // 10 second timeout
      });

      // Race between the query and timeout
      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('Error fetching user role:', error);
        
        // If still failing, check if this is the super admin email
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .maybeSingle();
        
        if (profileData && !profileError) {
          if (profileData.email === 'gene@stravisor.com') {
            console.log('=== DETECTED SUPER ADMIN BY EMAIL ===');
            return 'super-admin';
          }
          return 'read-only';
        }
        
        return 'read-only';
      }

      console.log('=== USER ROLE FETCHED ===', data?.role);
      return data?.role as UserRole || 'read-only';
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      
      // On timeout or error, check if this is the super admin email as fallback
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .maybeSingle();
        
        if (profileData?.email === 'gene@stravisor.com') {
          console.log('=== FALLBACK: DETECTED SUPER ADMIN BY EMAIL ===');
          return 'super-admin';
        }
      } catch (fallbackError) {
        console.error('Fallback role check failed:', fallbackError);
      }
      
      return 'read-only';
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('=== GETTING INITIAL SESSION ===');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('=== INITIAL SESSION ===', session ? 'Found' : 'None');
        
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('=== FETCHING ROLE FOR INITIAL SESSION ===');
          const role = await fetchUserRole(session.user.id);
          console.log('=== INITIAL ROLE SET ===', role);
          setUserRole(role);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setCurrentUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('=== AUTH STATE CHANGED ===', event, session?.user?.email);
      
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('=== FETCHING ROLE FOR AUTH CHANGE ===');
        try {
          const role = await fetchUserRole(session.user.id);
          console.log('=== AUTH CHANGE ROLE SET ===', role);
          setUserRole(role);
        } catch (error) {
          console.error('Error fetching role on auth change:', error);
          setUserRole('read-only');
        }
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
