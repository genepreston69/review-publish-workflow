
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
      console.log('=== FETCHING USERS WITH ROLE DEBUGGING ===');
      
      // Fetch all profiles first
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
        console.error('=== PROFILES ERROR ===', profilesError);
        throw profilesError;
      }

      console.log('=== PROFILES FETCHED ===', profiles?.length, 'profiles found');
      console.log('=== PROFILES DATA ===', profiles);

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('=== ROLES ERROR ===', rolesError);
        throw rolesError;
      }

      console.log('=== USER ROLES FETCHED ===', userRoles?.length, 'role records found');
      console.log('=== USER ROLES DATA ===', userRoles);

      if (!profiles || !userRoles) {
        console.log('=== NO DATA RETURNED ===');
        setUsers([]);
        return;
      }

      // Combine the data - get the highest priority role for each user
      const usersWithRoles: UserWithRole[] = profiles.map(profile => {
        const userRoleRecords = userRoles.filter(role => role.user_id === profile.id);
        
        console.log(`=== ROLES FOR USER ${profile.email} (${profile.id}) ===`, userRoleRecords);
        
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
          console.log(`=== CHECKING ROLE ${roleRecord.role} with priority ${priority} ===`);
          if (priority > highestPriority) {
            highestPriority = priority;
            highestRole = roleRecord.role as UserRole;
          }
        });

        console.log(`=== FINAL ROLE FOR ${profile.email}: ${highestRole} ===`);

        return {
          ...profile,
          role: highestRole
        };
      });

      console.log('=== FINAL USERS WITH ROLES ===', usersWithRoles);
      setUsers(usersWithRoles);

      toast({
        title: "Success",
        description: `Loaded ${usersWithRoles.length} users successfully.`,
      });
    } catch (error) {
      console.error('=== ERROR FETCHING USERS ===', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please check your permissions and console for details.",
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
