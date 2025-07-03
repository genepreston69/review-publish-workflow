
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
    const azureUserId = account.localAccountId || account.homeAccountId;
    
    console.log('=== ENSURING USER PROFILE EXISTS ===');
    console.log('Azure User ID:', azureUserId);
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
      console.log('=== FOUND EXISTING PROFILE - NEVER TOUCHING ROLE ===', existingProfile);
      
      // For existing users, ONLY update the name if it has changed
      // NEVER touch the role field at all
      if (existingProfile.name !== userName) {
        console.log('=== UPDATING ONLY USER NAME, NEVER TOUCHING ROLE ===');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ name: userName })
          .eq('email', userEmail);
          
        if (updateError) {
          console.error('=== ERROR UPDATING USER NAME ===', updateError);
        } else {
          console.log('=== USER NAME UPDATED, ROLE UNTOUCHED ===', existingProfile.role);
        }
      }
      
      console.log('=== EXISTING USER - ROLE COMPLETELY UNTOUCHED ===', existingProfile.role);
      return; // Exit early for existing users
    }

    // Only create a new profile if none exists - this is a truly new user
    console.log('=== CREATING NEW PROFILE FOR COMPLETELY NEW USER ===');
    
    const newUserId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: newUserId,
        email: userEmail,
        name: userName,
        role: 'read-only' // Only new users get read-only by default
      });
    
    if (insertError) {
      console.error('=== ERROR CREATING NEW USER PROFILE ===', insertError);
    } else {
      console.log('=== NEW USER PROFILE CREATED WITH READ-ONLY ROLE ===');
      setUserRole('read-only');
    }
    
  } catch (error) {
    console.error('=== UNEXPECTED ERROR IN ensureUserProfileExists ===', error);
  }
};
