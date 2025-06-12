
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/user';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: UserRole;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('=== FETCHING USERS FROM PROFILES TABLE ===');
      
      // Fetch profiles directly since role is now stored in profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          created_at,
          user_role
        `);

      if (profilesError) {
        console.error('=== PROFILES ERROR ===', profilesError);
        throw profilesError;
      }

      console.log('=== PROFILES FETCHED ===', profiles);

      // Map the data to our interface
      const usersWithRoles: UserWithRole[] = profiles.map(profile => ({
        ...profile,
        role: (profile.user_role || 'read-only') as UserRole
      }));

      console.log('=== FINAL USERS WITH ROLES ===', usersWithRoles);
      setUsers(usersWithRoles);

      toast({
        title: "Success",
        description: `Loaded ${usersWithRoles.length} users successfully.`,
      });
    } catch (error) {
      console.error('=== ERROR FETCHING USERS ===', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please check your permissions.",
      });
      setUsers([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    fetchUsers
  };
};
