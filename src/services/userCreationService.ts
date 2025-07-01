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
    
    // Generate a UUID for the Azure AD user (this will be replaced when they first sign in)
    const temporaryUserId = crypto.randomUUID();
    
    // Create the user profile directly in the profiles table
    // The actual Azure AD user ID will be updated when they first sign in
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: temporaryUserId,
        email,
        name,
        role,
        initials: generateInitialsFromName(name)
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return {
        success: false,
        error: profileError.message
      };
    }

    console.log('User profile created successfully:', profileData.id);

    // Send notification email to the user
    try {
      const { error: emailError } = await supabase.functions.invoke('send-user-welcome-email', {
        body: {
          to: email,
          name,
          role,
          userId: profileData.id
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail user creation if email fails
      } else {
        console.log('Welcome email sent successfully');
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      // Don't fail user creation if email fails
    }

    return {
      success: true,
      userId: profileData.id
    };
    
  } catch (error: any) {
    console.error('Error in createUserProfile:', error);
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
