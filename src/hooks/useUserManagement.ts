
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
      console.log('=== FETCHING USERS FROM PROFILES ===');

      // Fetch all profiles with roles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log(`Found ${profiles?.length || 0} user profiles`);

      const usersWithRoles: User[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        role: profile.role as UserRole,
        name: profile.name || profile.email
      }));

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

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

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

      // Delete the profile (this will also remove access)
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
