
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
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          created_at,
          role
        `);

      if (error) {
        console.error('=== PROFILES ERROR ===', error);
        throw error;
      }

      console.log('=== PROFILES FETCHED ===', profiles);

      const usersWithRoles: UserWithRole[] = profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        created_at: profile.created_at,
        role: profile.role as UserRole
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
      setUsers([]);
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
