
import { AccountInfo } from '@azure/msal-browser';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export const ensureUserProfileExists = async (
  account: AccountInfo,
  setUserRole: (role: UserRole) => void
) => {
  try {
    const userEmail = account.username;
    const userName = account.name || userEmail;
    
    console.log('=== ENSURING USER PROFILE EXISTS ===');
    console.log('User Email:', userEmail);
    console.log('User Name:', userName);
    
    // First check if user profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, name')
      .eq('email', userEmail)
      .maybeSingle();

    if (profileError) {
      console.error('=== ERROR CHECKING EXISTING PROFILE ===', profileError);
      return;
    }

    if (existingProfile) {
      console.log('=== FOUND EXISTING PROFILE - PRESERVING ROLE ===', existingProfile);
      
      // For existing users, ONLY update the name if it has changed
      // NEVER touch the role field at all
      if (existingProfile.name !== userName) {
        console.log('=== UPDATING ONLY USER NAME, PRESERVING ROLE ===');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ name: userName })
          .eq('email', userEmail);
          
        if (updateError) {
          console.error('=== ERROR UPDATING USER NAME ===', updateError);
        } else {
          console.log('=== USER NAME UPDATED, ROLE PRESERVED ===', existingProfile.role);
        }
      }
      
      // Set the role from the existing profile - this is the key fix
      console.log('=== SETTING EXISTING USER ROLE ===', existingProfile.role);
      setUserRole(existingProfile.role as UserRole);
      return; // Exit early for existing users
    }

    // Only create a new profile if none exists - use the RPC function for new users
    console.log('=== CREATING NEW PROFILE FOR COMPLETELY NEW USER ===');
    
    const { data, error: rpcError } = await supabase
      .rpc('create_or_update_azure_user', {
        user_email: userEmail,
        user_name: userName,
        user_role: 'read-only' as UserRole
      });
    
    if (rpcError) {
      console.error('=== ERROR CREATING NEW USER PROFILE VIA RPC ===', rpcError);
      // If RPC fails, the user will default to read-only via the role service
      setUserRole('read-only');
    } else {
      console.log('=== NEW USER PROFILE CREATED WITH READ-ONLY ROLE ===', data);
      setUserRole('read-only');
    }
    
  } catch (error) {
    console.error('=== UNEXPECTED ERROR IN ensureUserProfileExists ===', error);
    // Default to read-only if there's any error
    setUserRole('read-only');
  }
};
