
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserRole = async (userId: string): Promise<UserRole> => {
  console.log('=== FETCHING ROLE FOR USER ===', userId);
  
  try {
    // Use a more direct query with better error handling
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to handle case where no row exists

    if (error) {
      console.error('=== ERROR FETCHING USER ROLE ===', error);
      // If it's a connection error, throw to trigger retry
      if (error.message?.includes('Failed to fetch') || error.code === 'PGRST301') {
        throw error;
      }
      // For other errors, return default role
      console.log('=== USING DEFAULT ROLE DUE TO ERROR ===');
      return 'read-only';
    }

    if (!data) {
      console.log('=== NO PROFILE FOUND, CREATING DEFAULT PROFILE ===');
      // Try to create a profile for this user
      try {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: 'New User',
            email: '', // Will be updated with actual email if available
            role: 'read-only'
          });
        
        if (insertError) {
          console.error('=== ERROR CREATING PROFILE ===', insertError);
        }
      } catch (insertErr) {
        console.error('=== PROFILE CREATION FAILED ===', insertErr);
      }
      
      return 'read-only';
    }

    console.log('=== USER ROLE DATA ===', data);
    const role = data.role as UserRole || 'read-only';
    console.log('=== FOUND ROLE ===', role);
    return role;
  } catch (error) {
    console.error('=== ERROR IN FETCH USER ROLE ===', error);
    throw error;
  }
};
