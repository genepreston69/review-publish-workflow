
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
        console.log('=== INITIALIZATION - ACCOUNTS FOUND ===', accounts);
        
        if (accounts.length > 0) {
          const account = accounts[0];
          console.log('=== SETTING CURRENT USER FROM EXISTING ACCOUNT ===', account);
          setCurrentUser(account);
          await ensureUserProfileExists(account);
        } else {
          console.log('=== NO EXISTING ACCOUNTS FOUND ===');
        }
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const ensureUserProfileExists = async (account: AccountInfo) => {
    try {
      const userEmail = account.username;
      const userName = account.name || userEmail;
      const azureUserId = account.localAccountId || account.homeAccountId;
      
      console.log('=== ENSURING USER PROFILE EXISTS ===');
      console.log('Azure User ID:', azureUserId);
      console.log('User Email:', userEmail);
      console.log('User Name:', userName);
      
      // First check if user profile exists and get their role
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', userEmail)
        .maybeSingle();

      if (profileError) {
        console.error('=== ERROR CHECKING EXISTING PROFILE ===', profileError);
      }

      if (existingProfile) {
        console.log('=== FOUND EXISTING PROFILE WITH ROLE ===', existingProfile.role);
        setUserRole(existingProfile.role as UserRole);
        return;
      }

      // If no profile exists, create one with default role
      console.log('=== CREATING NEW PROFILE ===');
      const { createUserProfile } = await import('@/services/userCreationService');
      
      const result = await createUserProfile({
        email: userEmail,
        name: userName,
        role: 'read-only'
      });
      
      if (result.success) {
        console.log('=== USER PROFILE CREATED SUCCESSFULLY ===', result.userId);
        setUserRole('read-only');
      } else {
        console.error('=== ERROR FROM USER CREATION SERVICE ===', result.error);
        setUserRole('read-only');
      }
      
    } catch (error) {
      console.error('=== UNEXPECTED ERROR IN ensureUserProfileExists ===', error);
      setUserRole('read-only');
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      console.log('=== STARTING SIGN IN PROCESS ===');
      
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      console.log('=== SIGN IN RESPONSE ===', response);
      
      if (response.account) {
        console.log('=== SIGN IN SUCCESSFUL, SETTING USER ===', response.account);
        setCurrentUser(response.account);
        await ensureUserProfileExists(response.account);
      } else {
        console.log('=== NO ACCOUNT IN SIGN IN RESPONSE ===');
      }
    } catch (error) {
      console.error('=== LOGIN FAILED ===', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('=== SIGNING OUT ===');
      await msalInstance.logoutPopup();
      setCurrentUser(null);
      setUserRole(null);
      
      // Clear any Supabase session
      await supabase.auth.signOut();
      console.log('=== SIGN OUT COMPLETE ===');
    } catch (error) {
      console.error('=== LOGOUT FAILED ===', error);
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
