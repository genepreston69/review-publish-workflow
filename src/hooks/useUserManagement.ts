
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
      console.log('=== FETCHING USERS FROM PROFILES ===');
      
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('id, name, email, created_at, role')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load users: ${error.message}`,
        });
        setUsers([]);
        return;
      }

      console.log('=== PROFILES FETCHED ===', profilesData);

      if (!profilesData || profilesData.length === 0) {
        console.log('=== NO PROFILES FOUND ===');
        toast({
          title: "No Users Found",
          description: "No user profiles found in the database.",
        });
        setUsers([]);
        return;
      }

      const usersWithRoles: UserWithRole[] = profilesData.map(profile => ({
        id: profile.id,
        name: profile.name || 'Unknown',
        email: profile.email,
        created_at: profile.created_at || new Date().toISOString(),
        role: profile.role as UserRole
      }));

      console.log('=== FINAL USERS WITH ROLES ===', usersWithRoles);
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading users.",
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
    fetchUsers,
  };
};
