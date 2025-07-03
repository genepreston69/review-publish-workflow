
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
        console.log('=== INITIALIZATION - ACCOUNTS FOUND ===', accounts);
        
        if (accounts.length > 0) {
          const account = accounts[0];
          console.log('=== SETTING CURRENT USER FROM EXISTING ACCOUNT ===', account);
          setCurrentUser(account);
          await ensureUserProfileExists(account);
        } else {
          console.log('=== NO EXISTING ACCOUNTS FOUND ===');
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
      console.log('Account Object:', JSON.stringify(account, null, 2));
      
      // Test Supabase connection first
      console.log('=== TESTING SUPABASE CONNECTION ===');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('=== SUPABASE CONNECTION ERROR ===', testError);
        setUserRole('read-only');
        return;
      }
      
      console.log('=== SUPABASE CONNECTION SUCCESSFUL ===');
      
      // Check if user exists by email
      console.log('=== CHECKING FOR EXISTING PROFILE BY EMAIL ===');
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (checkError) {
        console.error('=== ERROR CHECKING EXISTING PROFILE ===', checkError);
        setUserRole('read-only');
        return;
      }

      if (existingProfile) {
        console.log('=== EXISTING PROFILE FOUND ===', existingProfile);
        
        // Update the Azure ID and name if needed
        if (existingProfile.id !== azureUserId || existingProfile.name !== userName) {
          console.log('=== UPDATING EXISTING PROFILE ===');
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ 
              id: azureUserId,
              name: userName,
              initials: getInitialsFromName(userName)
            })
            .eq('email', userEmail)
            .select()
            .single();
            
          if (updateError) {
            console.error('=== ERROR UPDATING PROFILE ===', updateError);
            // Continue with existing profile data
            setUserRole(existingProfile.role as UserRole);
          } else {
            console.log('=== PROFILE UPDATED SUCCESSFULLY ===', updatedProfile);
            setUserRole(updatedProfile.role as UserRole);
          }
        } else {
          setUserRole(existingProfile.role as UserRole);
        }
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
      
      console.log('=== NEW PROFILE DATA ===', newProfile);

      const { data: createdProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (insertError) {
        console.error('=== ERROR CREATING USER PROFILE ===', insertError);
        console.error('=== ERROR DETAILS ===', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Try alternative approach with different ID
        if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
          console.log('=== TRYING WITH ALTERNATIVE ID ===');
          const alternativeId = `azure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const fallbackProfile = {
            id: alternativeId,
            email: userEmail,
            name: userName,
            role: 'read-only' as UserRole,
            initials: getInitialsFromName(userName)
          };
          
          console.log('=== ALTERNATIVE PROFILE DATA ===', fallbackProfile);
          
          const { data: fallbackCreated, error: fallbackError } = await supabase
            .from('profiles')
            .insert(fallbackProfile)
            .select()
            .single();
            
          if (fallbackError) {
            console.error('=== ERROR CREATING FALLBACK PROFILE ===', fallbackError);
            setUserRole('read-only');
          } else {
            console.log('=== FALLBACK PROFILE CREATED SUCCESSFULLY ===', fallbackCreated);
            setUserRole('read-only');
          }
        } else {
          // Try without specifying ID (let database generate it)
          console.log('=== TRYING WITHOUT SPECIFIED ID ===');
          const profileWithoutId = {
            email: userEmail,
            name: userName,
            role: 'read-only' as UserRole,
            initials: getInitialsFromName(userName)
          };
          
          const { data: generatedProfile, error: generatedError } = await supabase
            .from('profiles')
            .insert(profileWithoutId)
            .select()
            .single();
            
          if (generatedError) {
            console.error('=== ERROR CREATING PROFILE WITHOUT ID ===', generatedError);
            setUserRole('read-only');
          } else {
            console.log('=== PROFILE CREATED WITH GENERATED ID ===', generatedProfile);
            setUserRole('read-only');
          }
        }
      } else {
        console.log('=== NEW PROFILE CREATED SUCCESSFULLY ===', createdProfile);
        setUserRole('read-only');
      }
    } catch (error) {
      console.error('=== UNEXPECTED ERROR IN ensureUserProfileExists ===', error);
      setUserRole('read-only');
    }
  };

  const getInitialsFromName = (name: string): string => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      console.log('=== STARTING SIGN IN PROCESS ===');
      
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      console.log('=== SIGN IN RESPONSE ===', response);
      
      if (response.account) {
        console.log('=== SIGN IN SUCCESSFUL, SETTING USER ===', response.account);
        setCurrentUser(response.account);
        await ensureUserProfileExists(response.account);
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
