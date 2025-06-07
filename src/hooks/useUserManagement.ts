
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
      
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine the data - get the highest priority role for each user
      const usersWithRoles: UserWithRole[] = profiles.map(profile => {
        const userRoleRecords = userRoles.filter(role => role.user_id === profile.id);
        
        // Priority order: super-admin > publish > edit > read-only
        const rolePriority = {
          'super-admin': 4,
          'publish': 3,
          'edit': 2,
          'read-only': 1
        };
        
        let highestRole: UserRole = 'read-only';
        let highestPriority = 0;
        
        userRoleRecords.forEach(roleRecord => {
          const priority = rolePriority[roleRecord.role as UserRole] || 0;
          if (priority > highestPriority) {
            highestPriority = priority;
            highestRole = roleRecord.role as UserRole;
          }
        });

        return {
          ...profile,
          role: highestRole
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      });
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
