
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching users...');

      // Fetch all profiles
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

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        // Continue without roles rather than failing completely
      }

      console.log(`Found ${userRoles?.length || 0} role records`);

      // Create a map of user_id to role for efficient lookup
      const userRolesMap = new Map<string, UserRole>();
      if (userRoles) {
        userRoles.forEach(roleRecord => {
          userRolesMap.set(roleRecord.user_id, roleRecord.role as UserRole);
        });
      }

      // Map profiles to users with their roles
      const usersWithRoles: User[] = profiles.map(profile => {
        const userRole = userRolesMap.get(profile.id) || 'read-only';
        
        console.log(`User ${profile.email} has role: ${userRole}`);

        return {
          id: profile.id,
          email: profile.email || '',
          role: userRole,
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
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      console.log('Updating user role:', { userId, newRole });

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole 
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

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
      console.log('Deleting user:', userId);

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
