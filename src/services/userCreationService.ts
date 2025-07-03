
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

export interface UserCreationResult {
  success: boolean;
  userId?: string;
  error?: string;
}

// Define the structure returned by the RPC function
interface RpcResponse {
  success: boolean;
  user_id?: string;
  error?: string;
  message?: string;
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

    // Cast the data to our expected response structure
    const response = data as RpcResponse;

    if (response && response.success) {
      return {
        success: true,
        userId: response.user_id
      };
    } else {
      return {
        success: false,
        error: response?.error || 'Unknown error'
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

export const createUserWithEmailNotification = async (params: CreateUserProfileParams): Promise<UserCreationResult> => {
  try {
    console.log('=== CREATING USER WITH EMAIL NOTIFICATION ===', params);
    
    // First create the user profile
    const profileResult = await createUserProfile(params);
    
    if (!profileResult.success) {
      return {
        success: false,
        error: profileResult.error
      };
    }

    // Send welcome email notification (this would typically call an edge function)
    // For now, we'll just return success since the main functionality is user creation
    console.log('=== USER CREATED SUCCESSFULLY, EMAIL WOULD BE SENT ===');
    
    return {
      success: true,
      userId: profileResult.userId
    };
  } catch (error) {
    console.error('=== ERROR IN createUserWithEmailNotification ===', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
