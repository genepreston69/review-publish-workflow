
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMsal } from '@azure/msal-react';
import { UserRole } from '@/types/user';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { accounts } = useMsal();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        
        // Get the current Azure AD user's email
        const currentAccount = accounts[0];
        if (!currentAccount?.username) {
          console.log('=== NO AZURE AD ACCOUNT FOUND ===');
          setUserRole(null);
          return;
        }

        console.log('=== FETCHING USER ROLE FOR EMAIL ===', currentAccount.username);
        
        // Query the profiles table to get the user role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', currentAccount.username)
          .maybeSingle();

        if (error) {
          console.error('=== ERROR FETCHING USER ROLE ===', error);
          setUserRole('read-only'); // Default fallback
          return;
        }

        if (profile) {
          console.log('=== USER ROLE FOUND ===', profile.role);
          setUserRole(profile.role as UserRole);
        } else {
          console.log('=== NO PROFILE FOUND, DEFAULTING TO READ-ONLY ===');
          setUserRole('read-only');
        }
      } catch (error) {
        console.error('=== ERROR IN useUserRole ===', error);
        setUserRole('read-only'); // Default fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [accounts]);

  return { userRole, isLoading };
};
