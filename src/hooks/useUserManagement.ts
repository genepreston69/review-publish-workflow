
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
      console.log('=== FETCHING ALL USERS ===');
      
      // First, get all users from auth.users (requires service role)
      // Since we can't directly access auth.users, let's get all profiles
      // and also check if there are any missing profiles by trying a different approach
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          created_at,
          role
        `);

      if (profilesError) {
        console.error('=== PROFILES ERROR ===', profilesError);
        throw profilesError;
      }

      console.log('=== PROFILES FETCHED ===', profiles);

      // Try to get auth users count to see if there's a mismatch
      // We'll use RPC to get a count of auth users if we have a function for it
      // For now, let's work with what we have and suggest creating missing profiles

      const usersWithRoles: UserWithRole[] = profiles.map(profile => ({
        id: profile.id,
        name: profile.name || 'Unknown User',
        email: profile.email,
        created_at: profile.created_at,
        role: profile.role as UserRole || 'read-only'
      }));

      console.log('=== FINAL USERS WITH ROLES ===', usersWithRoles);
      setUsers(usersWithRoles);

      toast({
        title: "Success",
        description: `Loaded ${usersWithRoles.length} users successfully.`,
      });

      // Check if we're missing users by looking at the current user's session
      // and seeing if there might be other users
      if (usersWithRoles.length < 3) {
        console.log('=== CHECKING FOR MISSING PROFILES ===');
        toast({
          title: "Notice",
          description: "Some users might be missing profiles. Check the console for details.",
          variant: "default"
        });
      }

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
