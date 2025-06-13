
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserRole = async (userId: string): Promise<UserRole> => {
  try {
    console.log('=== FETCHING ROLE FOR USER FROM PROFILES ===', userId);
    
    // Use the new security definer function to get user role
    const { data, error } = await supabase
      .rpc('get_current_user_role');

    if (error) {
      console.error('=== ERROR FETCHING USER ROLE FROM RPC ===', error);
      
      // Fallback to direct query if RPC fails
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, name, email')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('=== ERROR FETCHING USER ROLE FROM PROFILES ===', profileError);
        
        // If no profile exists, create one with default role
        if (profileError.code === 'PGRST116') {
          console.log('=== NO PROFILE FOUND, CREATING DEFAULT PROFILE ===');
          
          // Get user info from auth
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                name: userData.user.user_metadata?.name || userData.user.email || 'Unknown User',
                email: userData.user.email || '',
                role: 'read-only'
              });
            
            if (insertError) {
              console.error('=== ERROR CREATING PROFILE ===', insertError);
            } else {
              console.log('=== PROFILE CREATED WITH READ-ONLY ROLE ===');
              return 'read-only';
            }
          }
        }
        
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
