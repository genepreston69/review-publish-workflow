
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
        
        // First get the profile ID from email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', currentAccount.username)
          .maybeSingle();

        if (profileError) {
          console.error('=== ERROR FETCHING PROFILE ===', profileError);
          setUserRole('read-only'); // Default fallback
          return;
        }

        if (!profile) {
          console.log('=== NO PROFILE FOUND, DEFAULTING TO READ-ONLY ===');
          setUserRole('read-only');
          return;
        }

        // Query the user_roles table to get the user role
        const { data: userRoleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (roleError) {
          console.error('=== ERROR FETCHING USER ROLE ===', roleError);
          setUserRole('read-only'); // Default fallback
          return;
        }

        if (userRoleData) {
          console.log('=== USER ROLE FOUND ===', userRoleData.role);
          setUserRole(userRoleData.role as UserRole);
        } else {
          console.log('=== NO ROLE FOUND, DEFAULTING TO READ-ONLY ===');
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
