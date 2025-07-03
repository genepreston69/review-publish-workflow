
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
          await ensureUserProfileExists(account);
        }
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
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
      
      // First, check if user exists by email
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing profile:', checkError);
        setUserRole('read-only');
        return;
      }

      if (existingProfile) {
        console.log('=== EXISTING PROFILE FOUND ===', existingProfile);
        
        // Update the Azure ID if it's different (in case user signed in before)
        if (existingProfile.id !== azureUserId) {
          console.log('=== UPDATING PROFILE ID TO MATCH AZURE AD ===');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              id: azureUserId,
              name: userName,
              initials: getInitialsFromName(userName)
            })
            .eq('email', userEmail);
            
          if (updateError) {
            console.error('Error updating profile ID:', updateError);
          } else {
            console.log('Profile ID updated successfully');
          }
        }
        
        setUserRole(existingProfile.role as UserRole);
        return;
      }

      // No profile exists, create one
      console.log('=== CREATING NEW USER PROFILE ===');
      const newProfile = {
        id: azureUserId,
        email: userEmail,
        name: userName,
        role: 'read-only' as UserRole,
        initials: getInitialsFromName(userName)
      };

      const { data: createdProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        
        // Try to handle potential ID conflicts by using email as fallback
        if (insertError.code === '23505') { // unique constraint violation
          console.log('=== ID CONFLICT, TRYING WITH GENERATED ID ===');
          const fallbackProfile = {
            ...newProfile,
            id: crypto.randomUUID()
          };
          
          const { data: fallbackCreated, error: fallbackError } = await supabase
            .from('profiles')
            .insert(fallbackProfile)
            .select()
            .single();
            
          if (fallbackError) {
            console.error('Error creating fallback profile:', fallbackError);
            setUserRole('read-only');
          } else {
            console.log('=== FALLBACK PROFILE CREATED ===', fallbackCreated);
            setUserRole('read-only');
          }
        } else {
          setUserRole('read-only');
        }
      } else {
        console.log('=== NEW PROFILE CREATED SUCCESSFULLY ===', createdProfile);
        setUserRole('read-only');
      }
    } catch (error) {
      console.error('Error in ensureUserProfileExists:', error);
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
        await ensureUserProfileExists(response.account);
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
