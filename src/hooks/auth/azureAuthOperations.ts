
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
        
        // First, check if user already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('email', response.account.username)
          .maybeSingle();
        
        if (existingProfile) {
          console.log('=== EXISTING USER - FETCHING CURRENT ROLE ===', existingProfile);
          // For existing users, fetch their current role
          const role = await fetchUserRole(response.account.username, true);
          console.log('=== SETTING EXISTING USER ROLE ===', role);
          setUserRole(role);
        } else {
          console.log('=== NEW USER - CREATE PROFILE ===');
          // Only for new users, create profile and set role
          await ensureUserProfileExists(response.account, setUserRole);
        }
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
      console.log('=== STARTING SIGN OUT PROCESS ===');
      
      // Clear state first
      setCurrentUser(null);
      setUserRole(null);
      
      // Get all accounts and logout each one
      const accounts = msalInstance.getAllAccounts();
      console.log('=== ACCOUNTS TO LOGOUT ===', accounts);
      
      if (accounts.length > 0) {
        // Use logoutPopup instead of logoutRedirect to work in iframe
        await msalInstance.logoutPopup({
          account: accounts[0]
        });
        console.log('=== POPUP LOGOUT SUCCESSFUL ===');
      }
      
      // Clear any Supabase session
      await supabase.auth.signOut();
      console.log('=== SIGN OUT COMPLETE ===');
      
      // Navigate to auth page after successful logout
      window.location.href = '/auth';
    } catch (error) {
      console.error('=== LOGOUT FAILED ===', error);
      // Force redirect to auth page even if logout fails
      window.location.href = '/auth';
    }
  };
};
