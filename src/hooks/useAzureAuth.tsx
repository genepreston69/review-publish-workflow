
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/config/azureConfig';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

interface AzureAuthContextType {
  currentUser: AccountInfo | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AzureAuthContext = createContext<AzureAuthContextType | undefined>(undefined);

export const useAzureAuth = () => {
  const context = useContext(AzureAuthContext);
  if (!context) {
    throw new Error('useAzureAuth must be used within an AzureAuthProvider');
  }
  return context;
};

interface AzureAuthProviderProps {
  children: ReactNode;
}

export const AzureAuthProvider = ({ children }: AzureAuthProviderProps) => {
  const { instance, accounts, inProgress } = useMsal();
  const [currentUser, setCurrentUser] = useState<AccountInfo | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      console.log('=== FETCHING ROLE FOR AZURE USER ===', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: false })
        .limit(1);

      if (error) {
        console.error('=== ERROR FETCHING USER ROLE ===', error);
        return 'read-only';
      }

      if (data && data.length > 0) {
        const role = data[0].role as UserRole;
        console.log('=== FOUND ROLE ===', role);
        return role;
      }

      console.log('=== NO ROLE FOUND, DEFAULTING TO READ-ONLY ===');
      return 'read-only';
    } catch (error) {
      console.error('=== ERROR IN FETCH USER ROLE ===', error);
      return 'read-only';
    }
  };

  const ensureUserProfile = async (account: AccountInfo) => {
    try {
      // Check if user profile exists in Supabase
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', account.localAccountId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking user profile:', fetchError);
        return;
      }

      if (!existingProfile) {
        // Create user profile in Supabase
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: account.localAccountId,
            name: account.name || account.username || 'User',
            email: account.username || '',
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        // Assign default role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: account.localAccountId,
            role: 'read-only',
          });

        if (roleError) {
          console.error('Error assigning default role:', roleError);
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (inProgress === 'none') {
        if (accounts.length > 0) {
          const account = accounts[0];
          setCurrentUser(account);
          
          // Ensure user profile exists in Supabase
          await ensureUserProfile(account);
          
          // Fetch user role
          try {
            const role = await fetchUserRole(account.localAccountId);
            setUserRole(role);
          } catch (error) {
            console.error('Failed to fetch user role:', error);
            setUserRole('read-only');
          }
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [accounts, inProgress]);

  const signIn = async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      setCurrentUser(response.account);
      
      // Ensure user profile exists in Supabase
      await ensureUserProfile(response.account);
      
      // Fetch user role
      const role = await fetchUserRole(response.account.localAccountId);
      setUserRole(role);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const signOut = async () => {
    try {
      await instance.logoutPopup();
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (!currentUser) return null;
    
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: currentUser,
      });
      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire token:', error);
      return null;
    }
  };

  return (
    <AzureAuthContext.Provider
      value={{
        currentUser,
        userRole,
        isLoading,
        signIn,
        signOut,
        getAccessToken,
      }}
    >
      {children}
    </AzureAuthContext.Provider>
  );
};
