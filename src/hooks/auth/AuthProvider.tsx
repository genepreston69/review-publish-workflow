
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';
import { AuthContext } from './AuthContext';
import { AuthProviderProps } from './types';
import { useAzureAuth } from './AzureAuthContext';
import { supabase } from '@/integrations/supabase/client';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const azureAuth = useAzureAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Refresh user role function
  const refreshUserRole = async () => {
    if (azureAuth.currentUser) {
      try {
        console.log('=== REFRESHING USER ROLE IN AUTH PROVIDER ===');
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', azureAuth.currentUser.username)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          return;
        }

        if (profile) {
          console.log('=== REFRESHED USER ROLE IN AUTH PROVIDER ===', profile.role);
          setUserRole(profile.role as UserRole);
          
          // Also refresh the Azure auth role
          if (azureAuth.refreshUserRole) {
            await azureAuth.refreshUserRole();
          }
        }
      } catch (error) {
        console.error('Error refreshing user role:', error);
      }
    }
  };

  useEffect(() => {
    console.log('=== AUTH PROVIDER EFFECT TRIGGERED ===');
    console.log('Azure currentUser:', azureAuth.currentUser?.username);
    console.log('Azure userRole:', azureAuth.userRole);
    
    // Map Azure AD user to Supabase User interface for compatibility
    if (azureAuth.currentUser) {
      const mappedUser: User = {
        id: azureAuth.currentUser.localAccountId || azureAuth.currentUser.homeAccountId,
        aud: 'authenticated',
        role: 'authenticated',
        email: azureAuth.currentUser.username,
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {
          name: azureAuth.currentUser.name
        },
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setCurrentUser(mappedUser);
      
      // Create a mock session for compatibility
      const mockSession: Session = {
        access_token: 'azure-token',
        refresh_token: 'azure-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: mappedUser
      };
      
      setSession(mockSession);
      
      // Use the role from Azure auth
      console.log('=== SETTING USER ROLE FROM AZURE AUTH ===', azureAuth.userRole);
      setUserRole(azureAuth.userRole);
    } else {
      setCurrentUser(null);
      setSession(null);
      setUserRole(null);
    }
  }, [azureAuth.currentUser, azureAuth.userRole]);

  const signOut = async () => {
    await azureAuth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      session, 
      userRole, 
      isLoading: azureAuth.isLoading, 
      signOut,
      refreshUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
