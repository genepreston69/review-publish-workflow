
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserRole = async (userEmail: string, forceRefresh = false): Promise<UserRole> => {
  try {
    console.log('=== FETCHING USER ROLE FOR EMAIL ===', userEmail, 'Force refresh:', forceRefresh);
    
    // Add a small delay to ensure database is ready
    if (forceRefresh) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Direct query to profiles table with retry logic
    let profile = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!profile && attempts < maxAttempts) {
      attempts++;
      console.log(`=== ATTEMPT ${attempts} TO FETCH PROFILE ===`);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, email')
        .eq('email', userEmail)
        .maybeSingle();

      if (profileError) {
        console.error('=== ERROR FETCHING USER PROFILE ===', profileError);
        if (attempts === maxAttempts) {
          console.log('=== MAX ATTEMPTS REACHED, CREATING PROFILE VIA RPC ===');
          // Try to create the profile using RPC as a last resort
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('create_or_update_azure_user', {
              user_email: userEmail,
              user_name: userEmail.split('@')[0],
              user_role: 'read-only' as UserRole
            });
          
          if (!rpcError && rpcData) {
            console.log('=== PROFILE CREATED VIA RPC, RETURNING READ-ONLY ===');
            return 'read-only';
          }
          
          return 'read-only';
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      profile = profileData;
      
      if (!profile && attempts < maxAttempts) {
        console.log('=== NO PROFILE FOUND, RETRYING ===');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!profile) {
      console.log('=== NO PROFILE FOUND AFTER ALL ATTEMPTS, TRYING TO CREATE ONE ===');
      
      // Try to create the profile using RPC
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('create_or_update_azure_user', {
          user_email: userEmail,
          user_name: userEmail.split('@')[0],
          user_role: 'read-only' as UserRole
        });
      
      if (rpcError) {
        console.error('=== ERROR CREATING PROFILE VIA RPC ===', rpcError);
      } else {
        console.log('=== PROFILE CREATED VIA RPC ===', rpcData);
      }
      
      return 'read-only';
    }

    console.log('=== FOUND USER PROFILE WITH ROLE ===', profile);
    const userRole = profile.role as UserRole;
    
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
