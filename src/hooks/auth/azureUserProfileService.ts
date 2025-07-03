
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
    
    // First check if user profile exists by email (not by Azure ID as primary key)
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

    // Profile doesn't exist - try to create it but handle RLS errors gracefully
    console.log('=== ATTEMPTING TO CREATE NEW PROFILE ===');
    
    try {
      // Generate a UUID for the new user
      const userId = crypto.randomUUID();
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          name: userName,
          role: 'read-only' as UserRole,
          azure_id: azureId
        })
        .select()
        .single();
      
      if (insertError) {
        // Handle RLS or permission errors specifically
        if (insertError.code === 'PGRST301' || insertError.message?.includes('row-level security')) {
          console.warn('=== PROFILE CREATION BLOCKED BY RLS - CONTINUING WITH LOGIN ===');
          console.warn('Profile will need to be created manually by admin');
          setUserRole('read-only'); // Default role for new users
          return;
        }
        
        console.error('=== ERROR CREATING NEW USER PROFILE ===', insertError);
        setUserRole('read-only');
      } else {
        console.log('=== NEW USER PROFILE CREATED WITH READ-ONLY ROLE ===', newProfile);
        setUserRole('read-only');
      }
    } catch (createError) {
      console.warn('=== PROFILE CREATION FAILED - CONTINUING WITH LOGIN ===', createError);
      console.warn('User will have read-only access until profile is created manually');
      setUserRole('read-only');
    }
    
  } catch (error) {
    console.error('=== UNEXPECTED ERROR IN ensureUserProfileExists ===', error);
    setUserRole('read-only');
  }
};
