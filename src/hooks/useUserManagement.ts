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
      console.log('=== FETCHING USERS ===');

      // Get all user roles first to know which users we should look for
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }

      console.log(`Found ${userRoles?.length || 0} user role records`);

      if (!userRoles || userRoles.length === 0) {
        console.log('No user roles found');
        setUsers([]);
        return;
      }

      // Get user IDs from roles
      const userIds = userRoles.map(role => role.user_id);

      // Fetch profiles for these users - use left join approach by getting all profiles
      // and then filtering, to handle missing profiles gracefully
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Don't throw here, continue with empty profiles
      }

      console.log(`Found ${profiles?.length || 0} profiles`);

      // Create a map for efficient profile lookup
      const profilesMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Create a map for efficient role lookup
      const userRolesMap = new Map<string, UserRole>();
      userRoles.forEach(roleRecord => {
        userRolesMap.set(roleRecord.user_id, roleRecord.role as UserRole);
      });

      // Create users list, handling missing profiles
      const usersWithRoles: User[] = [];

      for (const roleRecord of userRoles) {
        const userId = roleRecord.user_id;
        const userRole = roleRecord.role as UserRole;
        const profile = profilesMap.get(userId);

        // If no profile exists, create a user entry with minimal info
        const user: User = {
          id: userId,
          email: profile?.email || `User ID: ${userId}`, // Fallback if no profile
          role: userRole,
          name: profile?.name || profile?.email || `User ${userId.slice(0, 8)}...` // Fallback name
        };

        console.log(`User ${user.email}:`, {
          hasProfile: !!profile,
          profileName: profile?.name,
          role: userRole
        });

        usersWithRoles.push(user);
      }

      console.log(`=== FINAL USER LIST ===`);
      console.log(`Total users: ${usersWithRoles.length}`);
      usersWithRoles.forEach(user => {
        console.log(`- ${user.email} (${user.name}) - ${user.role}`);
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

      // Since we can't use admin API, we can only delete the profile and role
      // The auth user will remain but won't be able to access the app
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error deleting user roles:', rolesError);
        throw rolesError;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw profileError;
      }

      toast({
        title: "Success",
        description: "User access removed successfully",
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to remove user access. Please try again.",
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
