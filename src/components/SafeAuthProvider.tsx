
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  userRole: string;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: 'read-only',
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('⚠️ useAuth called outside AuthProvider - using fallback state');
    return {
      user: null,
      userRole: 'read-only',
      isLoading: false,
      signOut: async () => {},
    };
  }
  return context;
};

export const SafeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('read-only');
  const [isLoading, setIsLoading] = useState(true);
  
  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user');
      await supabase.auth.signOut();
      setUser(null);
      setUserRole('read-only');
      isInitialized.current = false;
      currentUserId.current = null;
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
      console.log('🔍 Fetching role from profiles table for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('⚠️ Error fetching role:', error.message);
        return 'read-only';
      }

      if (!data) {
        console.log('⚠️ No profile found, defaulting to read-only');
        return 'read-only';
      }

      const role = data.user_role || 'read-only';
      console.log('✅ Role fetched successfully:', role);
      return role;
    } catch (error) {
      console.log('❌ Exception fetching role:', error);
      return 'read-only';
    }
  };

  const initializeAuth = async (authUser: User | null) => {
    try {
      console.log('🚀 Initializing auth for:', authUser?.email || 'no user');

      if (!authUser) {
        console.log('👤 No user, setting defaults');
        setUser(null);
        setUserRole('read-only');
        setIsLoading(false);
        isInitialized.current = true;
        currentUserId.current = null;
        return;
      }

      // Skip if already initialized for this user
      if (isInitialized.current && currentUserId.current === authUser.id) {
        console.log('✅ Already initialized for this user');
        setIsLoading(false);
        return;
      }

      setUser(authUser);
      currentUserId.current = authUser.id;

      // Fetch user role with timeout
      const rolePromise = fetchUserRole(authUser.id);
      const timeoutPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
          console.log('⏰ Role fetch timeout, using default');
          resolve('read-only');
        }, 3000);
      });

      const role = await Promise.race([rolePromise, timeoutPromise]);
      
      setUserRole(role);
      setIsLoading(false);
      isInitialized.current = true;
      
      console.log('✅ Auth initialization complete. Role:', role);
      
    } catch (error) {
      console.log('❌ Auth initialization error:', error);
      setUserRole('read-only');
      setIsLoading(false);
      isInitialized.current = true;
    }
  };

  useEffect(() => {
    console.log('🎧 Setting up auth listener');
    
    // Emergency session cleanup
    const clearInvalidSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error && error.message.includes('refresh_token_not_found')) {
          console.log('🚨 CLEARING INVALID SESSION');
          await supabase.auth.signOut();
          return;
        }
      } catch (e) {
        console.log('🚨 SESSION CHECK FAILED - FORCING SIGNOUT');
        await supabase.auth.signOut();
      }
    };
    
    clearInvalidSession();

    // Emergency timeout to prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      console.log('🚨 EMERGENCY TIMEOUT - Setting defaults');
      setIsLoading(false);
      setUserRole('read-only');
      isInitialized.current = true;
    }, 10000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Initial session check:', session?.user?.email || 'no session');
      initializeAuth(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email || 'no user');
      
      clearTimeout(emergencyTimeout);
      
      if (event === 'SIGNED_OUT') {
        isInitialized.current = false;
        currentUserId.current = null;
      }
      
      await initializeAuth(session?.user || null);
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      clearTimeout(emergencyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    userRole,
    isLoading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
