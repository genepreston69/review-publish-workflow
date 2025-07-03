
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

interface CreateUserProfileParams {
  email: string;
  name: string;
  role: UserRole;
}

interface CreateUserProfileResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export const createUserProfile = async (params: CreateUserProfileParams): Promise<CreateUserProfileResult> => {
  try {
    console.log('=== CREATING USER PROFILE ===', params);
    
    // Use the RPC function to create or update user profile
    const { data, error } = await supabase
      .rpc('create_or_update_azure_user', {
        user_email: params.email,
        user_name: params.name,
        user_role: params.role
      });

    if (error) {
      console.error('=== ERROR CALLING RPC FUNCTION ===', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('=== RPC RESPONSE ===', data);

    if (data && data.success) {
      return {
        success: true,
        userId: data.user_id
      };
    } else {
      return {
        success: false,
        error: data?.error || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('=== UNEXPECTED ERROR IN createUserProfile ===', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
