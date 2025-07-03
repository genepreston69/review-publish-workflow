
import { useState, useEffect } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { UserRole } from '@/types/user';
import { fetchUserRole } from './azureUserRoleService';
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
          
          // Check/create user profile for existing sessions
          const userEmail = account.username;
          const userName = account.name || userEmail;
          
          console.log('=== CHECKING/CREATING PROFILE FOR EXISTING SESSION ===');
          
          // Check if profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role, name')
            .eq('email', userEmail)
            .maybeSingle();

          if (profileError) {
            console.error('=== ERROR CHECKING EXISTING PROFILE ===', profileError);
            setUserRole('read-only');
            return;
          }

          if (existingProfile) {
            console.log('=== FOUND EXISTING PROFILE FOR SESSION ===', existingProfile);
            const role = await fetchUserRole(userEmail, true);
            console.log('=== SETTING USER ROLE FROM EXISTING SESSION ===', role);
            setUserRole(role);
          } else {
            console.log('=== CREATING PROFILE FOR EXISTING SESSION ===');
            // Create new profile using RPC function
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('create_or_update_azure_user', {
                user_email: userEmail,
                user_name: userName,
                user_role: 'read-only' as UserRole
              });
            
            if (rpcError) {
              console.error('=== ERROR CREATING PROFILE FOR SESSION ===', rpcError);
              setUserRole('read-only');
            } else {
              console.log('=== PROFILE CREATED FOR SESSION ===', rpcData);
              setUserRole('read-only');
            }
          }
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
