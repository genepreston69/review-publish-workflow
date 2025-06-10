
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

      // First, get all auth users via the admin API
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }

      console.log(`Found ${authUsers.users?.length || 0} auth users`);

      if (!authUsers.users || authUsers.users.length === 0) {
        console.log('No auth users found');
        setUsers([]);
        return;
      }

      // Get user IDs from auth users
      const userIds = authUsers.users.map(user => user.id);

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Don't throw here - we can still show users even without profiles
      }

      console.log(`Found ${profiles?.length || 0} profiles`);

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        // Continue without roles rather than failing completely
      }

      console.log(`Found ${userRoles?.length || 0} role records`);

      // Create maps for efficient lookup
      const profilesMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      const userRolesMap = new Map<string, UserRole>();
      if (userRoles) {
        userRoles.forEach(roleRecord => {
          userRolesMap.set(roleRecord.user_id, roleRecord.role as UserRole);
        });
      }

      // Map auth users to our User type
      const usersWithRoles: User[] = authUsers.users.map(authUser => {
        const profile = profilesMap.get(authUser.id);
        const userRole = userRolesMap.get(authUser.id) || 'read-only';
        
        console.log(`User ${authUser.email}:`, {
          hasProfile: !!profile,
          profileName: profile?.name,
          role: userRole
        });

        return {
          id: authUser.id,
          email: authUser.email || '',
          role: userRole,
          name: profile?.name || authUser.email || 'Unknown User'
        };
      });

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

      // Delete from auth (this will cascade to profiles and user_roles due to foreign keys)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) throw authError;

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
