
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserRole = async (userId: string): Promise<UserRole> => {
  try {
    console.log('=== FETCHING ROLE FOR USER ===', userId);
    
    // Add timeout to the RPC call
    const rolePromise = supabase.rpc('get_current_user_role');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Role fetch timeout')), 3000)
    );

    const { data, error } = await Promise.race([
      rolePromise,
      timeoutPromise
    ]) as any;

    if (error) {
      console.error('=== ERROR FETCHING USER ROLE FROM RPC ===', error);
      
      // Fallback to direct query if RPC fails
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('=== ERROR FETCHING USER ROLE FROM PROFILES ===', profileError);
        return 'read-only';
      }

      if (profileData && profileData.role) {
        const role = profileData.role as UserRole;
        console.log('=== FOUND ROLE IN PROFILES FALLBACK ===', role);
        return role;
      }
    }

    if (data) {
      const role = data as UserRole;
      console.log('=== FOUND ROLE FROM RPC ===', role);
      return role;
    }

    console.log('=== NO ROLE FOUND, DEFAULTING TO READ-ONLY ===');
    return 'read-only';
  } catch (error) {
    console.error('=== ERROR IN FETCH USER ROLE ===', error);
    return 'read-only';
  }
};

export const signOutUser = async () => {
  console.log('=== SIGNING OUT ===');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      console.log('=== SIGN OUT SUCCESSFUL ===');
    }
  } catch (error) {
    console.error('=== UNEXPECTED SIGN OUT ERROR ===', error);
  }
};
