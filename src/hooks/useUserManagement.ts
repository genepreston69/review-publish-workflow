
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching users...');

      // First fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log(`Found ${profiles?.length || 0} profiles`);

      if (!profiles || profiles.length === 0) {
        setUsers([]);
        return;
      }

      // Then fetch all user roles separately
      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        // Continue without roles rather than failing completely
      }

      console.log(`Found ${allRoles?.length || 0} role records`);

      // Create a map of user_id to roles for efficient lookup
      const userRolesMap = new Map<string, UserRole[]>();
      if (allRoles) {
        allRoles.forEach(roleRecord => {
          const userId = roleRecord.user_id;
          const role = roleRecord.role as UserRole;
          if (!userRolesMap.has(userId)) {
            userRolesMap.set(userId, []);
          }
          userRolesMap.get(userId)!.push(role);
        });
      }

      // Map profiles to users with their roles
      const usersWithRoles: User[] = profiles.map(profile => {
        const userRoles = userRolesMap.get(profile.id) || [];
        
        // If user has multiple roles, pick the highest priority one
        let finalRole: UserRole = 'read-only';
        if (userRoles.length > 0) {
          const roleHierarchy: Record<UserRole, number> = {
            'super-admin': 4,
            'publish': 3,
            'edit': 2,
            'read-only': 1
          };
          
          finalRole = userRoles.reduce((highest, current) => {
            return roleHierarchy[current] > roleHierarchy[highest] ? current : highest;
          }, 'read-only' as UserRole);
        }

        console.log(`User ${profile.email} has roles: ${userRoles.join(', ')}, using: ${finalRole}`);

        return {
          id: profile.id,
          email: profile.email || '',
          role: finalRole,
          name: profile.name || ''
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      // First, delete existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete user roles first
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateUserName = async (userId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: newName })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User name updated successfully",
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error updating user name:', error);
      toast({
        title: "Error",
        description: "Failed to update user name. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    users,
    isLoading,
    updateUserRole,
    deleteUser,
    updateUserName,
    refetch: fetchUsers
  };
}
