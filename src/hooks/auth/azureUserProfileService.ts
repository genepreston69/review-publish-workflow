
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
    const azureId = account.localAccountId || account.homeAccountId;
    
    console.log('=== ENSURING USER PROFILE EXISTS ===');
    console.log('User Email:', userEmail);
    console.log('User Name:', userName);
    console.log('Azure ID:', azureId);
    
    // First check if user profile exists by email
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, name, azure_id')
      .eq('email', userEmail)
      .maybeSingle();

    if (profileError) {
      console.error('=== ERROR CHECKING EXISTING PROFILE ===', profileError);
      setUserRole('read-only');
      return;
    }

    if (existingProfile) {
      console.log('=== FOUND EXISTING PROFILE - PRESERVING ROLE ===', existingProfile);
      
      // Update Azure ID if it's missing or different, but NEVER update the role
      if (!existingProfile.azure_id || existingProfile.azure_id !== azureId) {
        console.log('=== UPDATING AZURE ID FOR EXISTING USER ===');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            azure_id: azureId,
            name: userName // Also update name in case it changed
            // IMPORTANT: Do NOT include role here - preserve existing role
          })
          .eq('email', userEmail);
          
        if (updateError) {
          console.error('=== ERROR UPDATING AZURE ID ===', updateError);
        } else {
          console.log('=== AZURE ID UPDATED FOR EXISTING USER ===');
        }
      }
      
      // Set the role from the existing profile - this preserves admin roles
      console.log('=== SETTING EXISTING USER ROLE ===', existingProfile.role);
      setUserRole(existingProfile.role as UserRole);
      return;
    }

    // Only create a new profile if none exists - use the RPC function for new users
    console.log('=== CREATING NEW PROFILE FOR COMPLETELY NEW USER ===');
    
    const { data, error: rpcError } = await supabase
      .rpc('create_or_update_azure_user', {
        user_email: userEmail,
        user_name: userName,
        user_role: 'read-only' as UserRole // Only set read-only for NEW users
      });
    
    if (rpcError) {
      console.error('=== ERROR CREATING NEW USER PROFILE VIA RPC ===', rpcError);
      setUserRole('read-only');
    } else {
      console.log('=== NEW USER PROFILE CREATED WITH READ-ONLY ROLE ===', data);
      
      // Now update the newly created profile with Azure ID
      const { error: azureIdError } = await supabase
        .from('profiles')
        .update({ azure_id: azureId })
        .eq('email', userEmail);
        
      if (azureIdError) {
        console.error('=== ERROR SETTING AZURE ID FOR NEW USER ===', azureIdError);
      } else {
        console.log('=== AZURE ID SET FOR NEW USER ===');
      }
      
      setUserRole('read-only');
    }
    
  } catch (error) {
    console.error('=== UNEXPECTED ERROR IN ensureUserProfileExists ===', error);
    setUserRole('read-only');
  }
};
