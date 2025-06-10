
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/user';

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('read-only');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole('read-only');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);
      
      // Simple direct query without timeout
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('read-only');
      } else if (data && data.length > 0) {
        // If user has multiple roles, pick the highest priority one
        const roles = data.map(r => r.role as UserRole);
        const roleHierarchy: Record<UserRole, number> = {
          'super-admin': 4,
          'publish': 3,
          'edit': 2,
          'read-only': 1
        };
        
        const highestRole = roles.reduce((highest, current) => {
          return roleHierarchy[current] > roleHierarchy[highest] ? current : highest;
        }, 'read-only' as UserRole);
        
        console.log('User roles found:', roles, 'Using highest:', highestRole);
        setUserRole(highestRole);
      } else {
        console.log('No roles found for user, defaulting to read-only');
        setUserRole('read-only');
      }
    } catch (err) {
      console.error('Unexpected error in fetchUserRole:', err);
      setUserRole('read-only');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole('read-only');
  };

  return (
    <AuthContext.Provider value={{ user, userRole, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
