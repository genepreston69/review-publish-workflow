
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';
import { AuthContext } from './AuthContext';
import { AuthProviderProps } from './types';
import { useAzureAuth } from './AzureAuthContext';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const azureAuth = useAzureAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
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
    } else {
      setCurrentUser(null);
      setSession(null);
    }
  }, [azureAuth.currentUser]);

  const signOut = async () => {
    await azureAuth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      session, 
      userRole: azureAuth.userRole, 
      isLoading: azureAuth.isLoading, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
