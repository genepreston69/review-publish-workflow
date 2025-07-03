
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const fetchUserRole = async (userId: string): Promise<UserRole> => {
  try {
    console.log('=== FETCHING ROLE FOR USER ===', userId);
    
    // Query user_roles table directly
    const { data: userRoleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleError) {
      console.error('=== ERROR FETCHING USER ROLE FROM USER_ROLES ===', roleError);
      return 'read-only';
    }

    if (userRoleData) {
      const role = userRoleData.role as UserRole;
      console.log('=== FOUND ROLE FROM USER_ROLES ===', role);
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

export const updateUserProfile = async (userId: string, updates: {
  name?: string;
  phone_number?: string;
  email?: string;
}) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    console.log('Profile updated successfully');
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};
