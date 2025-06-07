
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
  status?: 'active' | 'pending' | 'inactive' | 'invited';
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      console.log('=== FETCHING USERS FOR MANAGEMENT ===');
      
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('=== PROFILES FETCHED ===', profiles?.length);

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      console.log('=== ROLES FETCHED ===', userRoles?.length);

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
          role: highestRole,
          status: 'active' as const // Default status for existing users
        };
      });

      console.log('=== FINAL USERS WITH ROLES ===', usersWithRoles.length);
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

  // Bulk actions for user management
  const bulkUpdateRoles = async (userIds: string[], newRole: UserRole) => {
    try {
      // Delete existing roles for these users
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .in('user_id', userIds);

      if (deleteError) throw deleteError;

      // Insert new roles
      const roleUpdates = userIds.map(userId => ({
        user_id: userId,
        role: newRole
      }));

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(roleUpdates);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `Updated roles for ${userIds.length} users.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating roles:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user roles.",
      });
    }
  };

  const bulkDeleteUsers = async (userIds: string[]) => {
    try {
      // Delete user roles first
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Delete profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .in('id', userIds);

      if (profilesError) throw profilesError;

      toast({
        title: "Success",
        description: `Deleted ${userIds.length} users.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete users.",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    fetchUsers,
    bulkUpdateRoles,
    bulkDeleteUsers
  };
};
