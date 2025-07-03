
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
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserRole = async (userEmail: string, forceRefresh = false) => {
    try {
      console.log('=== FETCHING USER ROLE FOR EMAIL ===', userEmail, 'Force refresh:', forceRefresh);
      
      // First check profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', userEmail)
        .maybeSingle();

      if (profileError) {
        console.error('=== ERROR FETCHING USER PROFILE ===', profileError);
      }

      let userRole: UserRole = 'read-only';
      let userId: string | null = null;

      if (profile) {
        console.log('=== FOUND USER PROFILE ===', profile);
        userRole = profile.role as UserRole;
        userId = profile.id;
      }

      // Also check user_roles table for additional roles
      if (userId) {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (rolesError) {
          console.error('=== ERROR FETCHING USER ROLES ===', rolesError);
        } else if (userRoles && userRoles.length > 0) {
          console.log('=== FOUND USER ROLES ===', userRoles);
          
          // Take the highest priority role
          const roleHierarchy = {
            'super-admin': 4,
            'publish': 3,
            'edit': 2,
            'read-only': 1
          };
          
          const highestRole = userRoles.reduce((highest, current) => {
            const currentPriority = roleHierarchy[current.role as UserRole] || 0;
            const highestPriority = roleHierarchy[highest] || 0;
            return currentPriority > highestPriority ? current.role as UserRole : highest;
          }, userRole);
          
          userRole = highestRole;
          console.log('=== HIGHEST ROLE FROM USER_ROLES ===', userRole);
        }
      }

      console.log('=== FINAL USER ROLE ===', userRole);
      return userRole;
    } catch (error) {
      console.error('=== ERROR IN fetchUserRole ===', error);
      return 'read-only' as UserRole;
    }
  };

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
          
          await ensureUserProfileExists(account);
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
      
      // First check if user profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, name')
        .eq('email', userEmail)
        .maybeSingle();

      if (profileError) {
        console.error('=== ERROR CHECKING EXISTING PROFILE ===', profileError);
        return;
      }

      if (existingProfile) {
        console.log('=== FOUND EXISTING PROFILE - PRESERVING ROLE ===', existingProfile);
        
        // Update only the name if it has changed, NEVER touch the role
        if (existingProfile.name !== userName) {
          console.log('=== UPDATING ONLY USER NAME, PRESERVING ROLE ===');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ name: userName })
            .eq('email', userEmail);
            
          if (updateError) {
            console.error('=== ERROR UPDATING USER NAME ===', updateError);
          } else {
            console.log('=== USER NAME UPDATED, ROLE PRESERVED ===', existingProfile.role);
          }
        }
        
        console.log('=== EXISTING USER - ROLE COMPLETELY PRESERVED ===', existingProfile.role);
        return;
      }

      // Only create a new profile if none exists - this is a truly new user
      console.log('=== CREATING NEW PROFILE FOR COMPLETELY NEW USER ===');
      
      // Create the profile directly without using the service to avoid any role overrides
      const newUserId = crypto.randomUUID();
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          email: userEmail,
          name: userName,
          role: 'read-only' // Only new users get read-only by default
        });
      
      if (insertError) {
        console.error('=== ERROR CREATING NEW USER PROFILE ===', insertError);
      } else {
        console.log('=== NEW USER PROFILE CREATED WITH READ-ONLY ROLE ===');
        setUserRole('read-only');
      }
      
    } catch (error) {
      console.error('=== UNEXPECTED ERROR IN ensureUserProfileExists ===', error);
    }
  };

  const refreshUserRole = async () => {
    if (currentUser) {
      console.log('=== REFRESHING USER ROLE WITH FORCE REFRESH ===');
      const role = await fetchUserRole(currentUser.username, true);
      console.log('=== REFRESHED USER ROLE ===', role);
      setUserRole(role);
    }
  };

  const signIn = async () => {
    if (!isInitialized) {
      console.error('=== MSAL NOT INITIALIZED YET ===');
      return;
    }

    try {
      setIsLoading(true);
      console.log('=== STARTING SIGN IN PROCESS ===');
      
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      console.log('=== SIGN IN RESPONSE ===', response);
      
      if (response.account) {
        console.log('=== SIGN IN SUCCESSFUL, SETTING USER ===', response.account);
        setCurrentUser(response.account);
        
        // Ensure profile exists first (this won't overwrite existing roles)
        await ensureUserProfileExists(response.account);
        
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

  const signOut = async () => {
    if (!isInitialized) {
      console.error('=== MSAL NOT INITIALIZED YET ===');
      return;
    }

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
