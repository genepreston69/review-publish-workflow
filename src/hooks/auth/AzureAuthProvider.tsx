
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
        if (accounts.length > 0) {
          const account = accounts[0];
          setCurrentUser(account);
          await createSupabaseSession(account);
          await fetchUserRole(account);
        }
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const createSupabaseSession = async (account: AccountInfo) => {
    try {
      // Create a custom JWT payload for the Azure AD user
      const customToken = {
        sub: account.localAccountId || account.homeAccountId,
        email: account.username,
        name: account.name || account.username,
        aud: 'authenticated',
        role: 'authenticated',
        iss: 'azure-ad',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
        iat: Math.floor(Date.now() / 1000)
      };

      console.log('Creating Supabase session for Azure AD user:', account.username);
      
      // Set the session in Supabase (this is a mock session for compatibility)
      // Since we're bypassing Supabase auth, we'll handle the session state manually
      
    } catch (error) {
      console.error('Error creating Supabase session:', error);
    }
  };

  const fetchUserRole = async (account: AccountInfo) => {
    try {
      // Use Azure AD user ID for profile lookup
      const userId = account.localAccountId || account.homeAccountId;
      const userEmail = account.username;
      
      console.log('=== FETCHING USER ROLE FOR AZURE AD USER ===');
      console.log('User ID:', userId);
      console.log('User Email:', userEmail);
      
      // First, try to find user by email (most reliable)
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile by email:', error);
      }

      if (profile) {
        console.log('=== FOUND PROFILE BY EMAIL ===', profile);
        
        // Update the profile with the correct Azure AD user ID if needed
        if (profile.id !== userId) {
          console.log('=== UPDATING PROFILE ID TO MATCH AZURE AD ===');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ id: userId })
            .eq('email', userEmail);
            
          if (updateError) {
            console.error('Error updating profile ID:', updateError);
          } else {
            console.log('Profile ID updated successfully');
          }
        }
        
        setUserRole(profile.role as UserRole);
        return;
      }

      // If no profile found by email, try by ID
      const { data: profileById, error: errorById } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (errorById && errorById.code !== 'PGRST116') {
        console.error('Error fetching user role by ID:', errorById);
      }

      if (profileById) {
        console.log('=== FOUND PROFILE BY ID ===', profileById);
        setUserRole(profileById.role as UserRole);
        return;
      }

      // If no profile exists, create one
      console.log('=== NO PROFILE FOUND, CREATING NEW ONE ===');
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          name: account.name || userEmail,
          role: 'read-only',
          initials: getInitialsFromName(account.name || userEmail)
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        setUserRole('read-only');
      } else {
        console.log('=== NEW PROFILE CREATED ===', newProfile);
        setUserRole('read-only');
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('read-only');
    }
  };

  const getInitialsFromName = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      
      if (response.account) {
        setCurrentUser(response.account);
        await createSupabaseSession(response.account);
        await fetchUserRole(response.account);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await msalInstance.logoutPopup();
      setCurrentUser(null);
      setUserRole(null);
      
      // Clear any Supabase session
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
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
