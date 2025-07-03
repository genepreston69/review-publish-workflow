
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserRole = async (userEmail: string, forceRefresh = false): Promise<UserRole> => {
  try {
    console.log('=== FETCHING USER ROLE FOR EMAIL ===', userEmail, 'Force refresh:', forceRefresh);
    
    // First check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', userEmail)
      .maybeSingle();

    if (profileError) {
      console.error('=== ERROR FETCHING USER PROFILE ===', profileError);
    }

    let userRole: UserRole = 'read-only';
    let userId: string | null = null;

    if (profile) {
      console.log('=== FOUND USER PROFILE ===', profile);
      userRole = profile.role as UserRole;
      userId = profile.id;
    }

    // Also check user_roles table for additional roles
    if (userId) {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('=== ERROR FETCHING USER ROLES ===', rolesError);
      } else if (userRoles && userRoles.length > 0) {
        console.log('=== FOUND USER ROLES ===', userRoles);
        
        // Take the highest priority role
        const roleHierarchy = {
          'super-admin': 4,
          'publish': 3,
          'edit': 2,
          'read-only': 1
        };
        
        const highestRole = userRoles.reduce((highest, current) => {
          const currentPriority = roleHierarchy[current.role as UserRole] || 0;
          const highestPriority = roleHierarchy[highest] || 0;
          return currentPriority > highestPriority ? current.role as UserRole : highest;
        }, userRole);
        
        userRole = highestRole;
        console.log('=== HIGHEST ROLE FROM USER_ROLES ===', userRole);
      }
    }

    console.log('=== FINAL USER ROLE ===', userRole);
    return userRole;
  } catch (error) {
    console.error('=== ERROR IN fetchUserRole ===', error);
    return 'read-only' as UserRole;
  }
};
