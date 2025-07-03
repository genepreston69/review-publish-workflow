
import { useState, useEffect } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { UserRole } from '@/types/user';
import { fetchUserRole } from './azureUserRoleService';
import { ensureUserProfileExists } from './azureUserProfileService';
import { supabase } from '@/integrations/supabase/client';

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
        
        // Always ensure MSAL is initialized first - this is critical
        await msalInstance.initialize();
        console.log('=== MSAL INITIALIZED SUCCESSFULLY ===');
        
        if (!isMounted) return;
        
        setIsInitialized(true);
        
        // Add a delay to ensure initialization is complete
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (!isMounted) return;
        
        // Now safely get accounts after initialization
        const accounts = msalInstance.getAllAccounts();
        console.log('=== INITIALIZATION - ACCOUNTS FOUND ===', accounts);
        
        if (accounts.length > 0) {
          const account = accounts[0];
          console.log('=== SETTING CURRENT USER FROM EXISTING ACCOUNT ===', account);
          setCurrentUser(account);
          
          // Always fetch the current role from database for existing sessions
          console.log('=== FETCHING ROLE FOR EXISTING SESSION ===');
          const role = await fetchUserRole(account.username, true);
          console.log('=== SETTING USER ROLE FROM EXISTING SESSION ===', role);
          setUserRole(role);
        } else {
          console.log('=== NO EXISTING ACCOUNTS FOUND ===');
          setCurrentUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
        if (isMounted) {
          setCurrentUser(null);
          setUserRole(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Start initialization immediately
    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [msalInstance, setCurrentUser, setUserRole]);

  return { isLoading, isInitialized };
};
