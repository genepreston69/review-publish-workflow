
import { useState, useEffect } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { UserRole } from '@/types/user';
import { fetchUserRole } from './azureUserRoleService';
import { ensureUserProfileExists } from './azureUserProfileService';

export const useAzureAuthInitialization = (
  msalInstance: PublicClientApplication,
  setCurrentUser: (user: AccountInfo | null) => void,
  setUserRole: (role: UserRole | null) => void
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('=== INITIALIZING MSAL ===');
        await msalInstance.initialize();
        console.log('=== MSAL INITIALIZED SUCCESSFULLY ===');
        
        if (!isMounted) return;
        
        setIsInitialized(true);
        
        const accounts = msalInstance.getAllAccounts();
        console.log('=== INITIALIZATION - ACCOUNTS FOUND ===', accounts);
        
        if (accounts.length > 0) {
          const account = accounts[0];
          console.log('=== SETTING CURRENT USER FROM EXISTING ACCOUNT ===', account);
          setCurrentUser(account);
          
          // Fetch the user role immediately with force refresh on initialization
          const role = await fetchUserRole(account.username, true);
          console.log('=== SETTING USER ROLE FROM INITIALIZATION ===', role);
          setUserRole(role);
          
          await ensureUserProfileExists(account, setUserRole);
        } else {
          console.log('=== NO EXISTING ACCOUNTS FOUND ===');
        }
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [msalInstance, setCurrentUser, setUserRole]);

  return { isLoading, isInitialized };
};
