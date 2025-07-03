
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserRole = async (userEmail: string, forceRefresh = false): Promise<UserRole> => {
  try {
    console.log('=== FETCHING USER ROLE FOR EMAIL ===', userEmail, 'Force refresh:', forceRefresh);
    
    // First check profiles table directly
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', userEmail)
      .maybeSingle();

    if (profileError) {
      console.error('=== ERROR FETCHING USER PROFILE ===', profileError);
      return 'read-only';
    }

    if (!profile) {
      console.log('=== NO PROFILE FOUND, DEFAULTING TO READ-ONLY ===');
      return 'read-only';
    }

    console.log('=== FOUND USER PROFILE WITH ROLE ===', profile);
    const userRole = profile.role as UserRole;
    
    // Also check user_roles table for additional roles (if any exist)
    if (profile.id) {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.id);

      if (rolesError) {
        console.error('=== ERROR FETCHING USER ROLES ===', rolesError);
      } else if (userRoles && userRoles.length > 0) {
        console.log('=== FOUND ADDITIONAL USER ROLES ===', userRoles);
        
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
        
        console.log('=== USING HIGHEST PRIORITY ROLE ===', highestRole);
        return highestRole;
      }
    }

    console.log('=== FINAL USER ROLE FROM PROFILES ===', userRole);
    return userRole;
  } catch (error) {
    console.error('=== ERROR IN fetchUserRole ===', error);
    return 'read-only';
  }
};
