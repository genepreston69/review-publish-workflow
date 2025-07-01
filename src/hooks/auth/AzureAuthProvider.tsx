
import { useState, useEffect, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { AzureAuthContext } from './AzureAuthContext';
import { msalConfig, loginRequest } from '@/config/azureAuthConfig';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

interface AzureAuthProviderProps {
  children: ReactNode;
}

const AzureAuthProviderInner = ({ children }: AzureAuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<AccountInfo | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await msalInstance.initialize();
        
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          setCurrentUser(account);
          await fetchUserRole(account);
        }
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserRole = async (account: AccountInfo) => {
    try {
      // Use Azure AD user ID for profile lookup
      const userId = account.localAccountId || account.homeAccountId;
      
      // Check if user exists in Supabase profiles table using their Azure AD ID
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        setUserRole('read-only');
        return;
      }

      if (profile) {
        setUserRole(profile.role as UserRole);
      } else {
        // Create new profile for Azure AD user
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: account.username,
            name: account.name || account.username,
            role: 'read-only',
            initials: getInitialsFromName(account.name || account.username)
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        }
        
        setUserRole('read-only');
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('read-only');
    }
  };

  const getInitialsFromName = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      
      if (response.account) {
        setCurrentUser(response.account);
        await fetchUserRole(response.account);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await msalInstance.logoutPopup();
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAuthenticated = currentUser !== null;

  return (
    <AzureAuthContext.Provider value={{
      currentUser,
      userRole,
      isLoading,
      signIn,
      signOut,
      isAuthenticated
    }}>
      {children}
    </AzureAuthContext.Provider>
  );
};

export const AzureAuthProvider = ({ children }: AzureAuthProviderProps) => {
  return (
    <MsalProvider instance={msalInstance}>
      <AzureAuthProviderInner>
        {children}
      </AzureAuthProviderInner>
    </MsalProvider>
  );
};
