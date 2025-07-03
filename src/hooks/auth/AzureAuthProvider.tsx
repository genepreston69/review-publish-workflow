
import { useState, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { UserRole } from '@/types/user';
import { AzureAuthContext } from './AzureAuthContext';
import { msalConfig } from '@/config/azureAuthConfig';
import { useAzureAuthInitialization } from './useAzureAuthInitialization';
import { createSignInHandler, createSignOutHandler } from './azureAuthOperations';
import { fetchUserRole } from './azureUserRoleService';

// Create MSAL instance with better error handling
const createMsalInstance = () => {
  try {
    return new PublicClientApplication(msalConfig);
  } catch (error) {
    console.error('=== FAILED TO CREATE MSAL INSTANCE ===', error);
    throw error;
  }
};

const msalInstance = createMsalInstance();

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

  // Show loading while initializing - improved loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render the app until MSAL is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Setting up authentication...</p>
        </div>
      </div>
    );
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
