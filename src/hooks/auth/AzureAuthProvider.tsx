
import { useState, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { UserRole } from '@/types/user';
import { AzureAuthContext } from './AzureAuthContext';
import { msalConfig } from '@/config/azureAuthConfig';
import { useAzureAuthInitialization } from './useAzureAuthInitialization';
import { createSignInHandler, createSignOutHandler } from './azureAuthOperations';
import { fetchUserRole } from './azureUserRoleService';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

interface AzureAuthProviderProps {
  children: ReactNode;
}

const AzureAuthProviderInner = ({ children }: AzureAuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<AccountInfo | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const { isLoading, isInitialized } = useAzureAuthInitialization(
    msalInstance,
    setCurrentUser,
    setUserRole
  );

  const refreshUserRole = async () => {
    if (currentUser) {
      console.log('=== REFRESHING USER ROLE WITH FORCE REFRESH ===');
      const role = await fetchUserRole(currentUser.username, true);
      console.log('=== REFRESHED USER ROLE ===', role);
      setUserRole(role);
    }
  };

  const signIn = createSignInHandler(msalInstance, () => {}, setCurrentUser, setUserRole);
  const signOut = createSignOutHandler(msalInstance, setCurrentUser, setUserRole);

  const isAuthenticated = currentUser !== null;

  // Don't render anything until MSAL is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <AzureAuthContext.Provider value={{
      currentUser,
      userRole,
      isLoading,
      signIn,
      signOut,
      isAuthenticated,
      refreshUserRole
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
