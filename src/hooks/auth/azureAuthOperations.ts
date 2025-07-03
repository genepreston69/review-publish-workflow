
import { PublicClientApplication, AuthenticationResult } from '@azure/msal-browser';
import { AccountInfo } from '@azure/msal-browser';
import { loginRequest } from '@/config/azureAuthConfig';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
import { ensureUserProfileExists } from './azureUserProfileService';
import { fetchUserRole } from './azureUserRoleService';

export const createSignInHandler = (
  msalInstance: PublicClientApplication,
  setIsLoading: (loading: boolean) => void,
  setCurrentUser: (user: AccountInfo | null) => void,
  setUserRole: (role: UserRole | null) => void
) => {
  return async () => {
    try {
      setIsLoading(true);
      console.log('=== STARTING SIGN IN PROCESS ===');
      
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      console.log('=== SIGN IN RESPONSE ===', response);
      
      if (response.account) {
        console.log('=== SIGN IN SUCCESSFUL, SETTING USER ===', response.account);
        setCurrentUser(response.account);
        
        // Ensure profile exists first (this won't overwrite existing roles)
        await ensureUserProfileExists(response.account, setUserRole);
        
        // Then fetch the actual role (checking both profiles and user_roles)
        const role = await fetchUserRole(response.account.username, true);
        console.log('=== SETTING USER ROLE FROM SIGN IN ===', role);
        setUserRole(role);
      } else {
        console.log('=== NO ACCOUNT IN SIGN IN RESPONSE ===');
      }
    } catch (error) {
      console.error('=== LOGIN FAILED ===', error);
    } finally {
      setIsLoading(false);
    }
  };
};

export const createSignOutHandler = (
  msalInstance: PublicClientApplication,
  setCurrentUser: (user: AccountInfo | null) => void,
  setUserRole: (role: UserRole | null) => void
) => {
  return async () => {
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
};
