
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

      // Fetch all profiles - this doesn't require admin privileges
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

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = profiles?.map(profile => {
        const userRoleRecords = userRoles?.filter(role => role.user_id === profile.id) || [];
        
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

        // Since we can't access auth admin API, we'll assume all profiles are active
        // This is a reasonable assumption since profiles are only created when users successfully sign up
        const status: 'active' | 'pending' | 'inactive' | 'invited' = 'active';

        return {
          ...profile,
          role: highestRole,
          status
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please check your permissions.",
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
      // First, check if any users have created policies
      const { data: policiesCheck, error: policiesError } = await supabase
        .from('Policies')
        .select('id, creator_id')
        .in('creator_id', userIds);

      if (policiesError) throw policiesError;

      if (policiesCheck && policiesCheck.length > 0) {
        const usersWithPolicies = [...new Set(policiesCheck.map(p => p.creator_id))];
        toast({
          variant: "destructive",
          title: "Cannot Delete Users",
          description: `${usersWithPolicies.length} user(s) have created policies and cannot be deleted. Please reassign or delete their policies first.`,
        });
        return;
      }

      // Delete user roles first
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Delete profiles (using 'id' column, not 'user_id')
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .in('id', userIds);

      if (profilesError) throw profilesError;

      toast({
        title: "Success",
        description: `Deleted ${userIds.length} users from the system.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete users. They may have associated content that needs to be removed first.",
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
