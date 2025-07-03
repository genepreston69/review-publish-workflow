
import { PublicClientApplication, AuthenticationResult } from '@azure/msal-browser';
import { AccountInfo } from '@azure/msal-browser';
import { loginRequest } from '@/config/azureAuthConfig';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';
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
        
        // Check if user profile exists in Supabase
        const userEmail = response.account.username;
        const userName = response.account.name || userEmail;
        const azureId = response.account.localAccountId || response.account.homeAccountId;
        
        console.log('=== CHECKING/CREATING USER PROFILE ===');
        console.log('Email:', userEmail);
        console.log('Name:', userName);
        console.log('Azure ID:', azureId);
        
        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role, name')
          .eq('email', userEmail)
          .maybeSingle();

        if (profileError) {
          console.error('=== ERROR CHECKING EXISTING PROFILE ===', profileError);
          // Default to read-only if there's an error
          setUserRole('read-only');
          return;
        }

        if (existingProfile) {
          console.log('=== FOUND EXISTING PROFILE ===', existingProfile);
          // User exists, just fetch their role
          const role = await fetchUserRole(userEmail, true);
          console.log('=== SETTING EXISTING USER ROLE ===', role);
          setUserRole(role);
        } else {
          console.log('=== CREATING NEW USER PROFILE ===');
          // Create new profile using RPC function
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('create_or_update_azure_user', {
              user_email: userEmail,
              user_name: userName,
              user_role: 'read-only' as UserRole
            });
          
          if (rpcError) {
            console.error('=== ERROR CREATING USER PROFILE ===', rpcError);
            setUserRole('read-only'); // Default fallback
          } else {
            console.log('=== NEW USER PROFILE CREATED ===', rpcData);
            setUserRole('read-only');
          }
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
