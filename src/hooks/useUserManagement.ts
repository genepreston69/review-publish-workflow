
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
      
      // First, let's check if we can access the profiles table at all
      const { data: profilesData, error, count } = await supabase
        .from('profiles')
        .select('id, name, email, created_at, role', { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log('=== PROFILES QUERY DETAILS ===');
      console.log('Data:', profilesData);
      console.log('Error:', error);
      console.log('Count:', count);
      console.log('Current user:', await supabase.auth.getUser());
      
      // Let's also check if there are any RLS issues by trying a simpler query
      const { data: simpleQuery, error: simpleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
        
      console.log('=== SIMPLE PROFILES QUERY ===');
      console.log('Simple data:', simpleQuery);
      console.log('Simple error:', simpleError);

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

      console.log('=== PROFILES WITH ROLES FETCHED ===', profilesData);

      if (!profilesData || profilesData.length === 0) {
        console.log('=== NO PROFILES FOUND - CHECKING AUTH.USERS ===');
        
        // Let's see if there are users in auth but no profiles
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
        console.log('Auth users:', authUsers);
        console.log('Auth error:', authError);
        
        toast({
          title: "No Users Found",
          description: "No user profiles found in the database.",
        });
        setUsers([]);
        return;
      }

      const usersWithRoles: UserWithRole[] = (profilesData || []).map(profile => ({
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
