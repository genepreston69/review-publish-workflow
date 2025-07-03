
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserRole = async (userEmail: string, forceRefresh = false): Promise<UserRole> => {
  try {
    console.log('=== FETCHING USER ROLE FOR EMAIL ===', userEmail, 'Force refresh:', forceRefresh);
    
    // Add a small delay to ensure database is ready
    if (forceRefresh) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Direct query to user_roles table joined with profiles table with retry logic
    let roleData = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!roleData && attempts < maxAttempts) {
      attempts++;
      console.log(`=== ATTEMPT ${attempts} TO FETCH USER ROLE ===`);
      
      const { data: roleResult, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role,
          profiles!inner(email)
        `)
        .eq('profiles.email', userEmail)
        .maybeSingle();

      if (roleError) {
        console.error('=== ERROR FETCHING USER ROLE ===', roleError);
        if (attempts === maxAttempts) {
          console.log('=== MAX ATTEMPTS REACHED, RETURNING READ-ONLY ===');
          return 'read-only';
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      roleData = roleResult;
      
      if (!roleData && attempts < maxAttempts) {
        console.log('=== NO ROLE FOUND, RETRYING ===');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!roleData) {
      console.log('=== NO ROLE FOUND AFTER ALL ATTEMPTS ===');
      return 'read-only';
    }

    console.log('=== FOUND USER ROLE ===', roleData);
    const userRole = roleData.role as UserRole;
    
    // Validate the role
    const validRoles: UserRole[] = ['read-only', 'edit', 'publish', 'super-admin'];
    if (!validRoles.includes(userRole)) {
      console.warn('=== INVALID ROLE FOUND, DEFAULTING TO READ-ONLY ===', userRole);
      return 'read-only';
    }
    
    console.log('=== FINAL USER ROLE ===', userRole);
    return userRole;
  } catch (error) {
    console.error('=== ERROR IN fetchUserRole ===', error);
    return 'read-only';
  }
};
