import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

interface CreateUserParams {
  email: string;
  name: string;
  role: UserRole;
}

export interface UserCreationResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export const createUserProfile = async (params: CreateUserParams): Promise<UserCreationResult> => {
  const { email, name, role } = params;
  
  try {
    console.log('=== CREATING USER PROFILE FOR AZURE AD USER ===', { email, name, role });
    
    // First try to check if user exists using a service role call
    console.log('=== CHECKING FOR EXISTING PROFILE BY EMAIL ===');
    
    // Use RPC call to create/update user profile with service role privileges
    const { data: result, error: rpcError } = await supabase.rpc('create_or_update_azure_user', {
      user_email: email,
      user_name: name,
      user_role: role
    });

    if (rpcError) {
      console.error('=== RPC ERROR ===', rpcError);
      
      // Fallback: try direct insert (may fail due to RLS)
      console.log('=== TRYING DIRECT INSERT AS FALLBACK ===');
      const profileData = {
        id: crypto.randomUUID(),
        email,
        name,
        role,
        initials: generateInitialsFromName(name)
      };

      const { data: directResult, error: directError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'email' })
        .select()
        .single();

      if (directError) {
        console.error('=== DIRECT INSERT FAILED ===', directError);
        return {
          success: false,
          error: `Failed to create user profile: ${directError.message}`
        };
      }

      console.log('=== DIRECT INSERT SUCCEEDED ===', directResult);
      return {
        success: true,
        userId: directResult.id
      };
    }

    console.log('=== RPC CALL SUCCEEDED ===', result);
    
    // Handle the JSON result from the RPC function
    if (result && typeof result === 'object' && 'success' in result) {
      const rpcResult = result as { success: boolean; user_id?: string; error?: string };
      
      if (rpcResult.success) {
        return {
          success: true,
          userId: rpcResult.user_id || 'unknown'
        };
      } else {
        return {
          success: false,
          error: rpcResult.error || 'Unknown error from RPC function'
        };
      }
    }

    // Fallback if result format is unexpected
    return {
      success: true,
      userId: 'unknown'
    };
    
  } catch (error: any) {
    console.error('=== ERROR IN createUserProfile ===', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
};

const generateInitialsFromName = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Keep the old function name for backward compatibility but mark as deprecated
/** @deprecated Use createUserProfile instead. This function is kept for backward compatibility. */
export const createUserWithEmailNotification = createUserProfile;

// Remove the temporary password generation since it's no longer needed
export const generateTemporaryPassword = (): string => {
  console.warn('generateTemporaryPassword is deprecated and no longer used with Azure AD authentication');
  return '';
};
