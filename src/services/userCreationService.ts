
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
  temporaryPassword?: string;
  error?: string;
}

export const generateTemporaryPassword = (): string => {
  // Generate a secure temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const createUserWithEmailNotification = async (params: CreateUserParams): Promise<UserCreationResult> => {
  const { email, name, role } = params;
  
  try {
    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();
    
    console.log('=== CREATING USER WITH EMAIL NOTIFICATION ===', { email, name, role });
    
    // Create the user using regular signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: temporaryPassword,
      options: {
        data: {
          name,
          full_name: name,
          display_name: name,
          user_name: name,
          username: name
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return {
        success: false,
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'User creation failed - no user data returned'
      };
    }

    console.log('User created successfully:', authData.user.id);
    
    // Wait for the profile to be created by the trigger
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the role if it's different from default
    if (role !== 'read-only') {
      console.log('Updating user role in profiles to:', role);
      
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', authData.user.id);

      if (roleError) {
        console.error('Role update error in profiles:', roleError);
        // Don't fail the creation, just log the error
      }
    }

    // Send welcome email with temporary password
    try {
      const { error: emailError } = await supabase.functions.invoke('send-user-welcome-email', {
        body: {
          to: email,
          name,
          role,
          temporaryPassword,
          userId: authData.user.id
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
      userId: authData.user.id,
      temporaryPassword
    };
    
  } catch (error: any) {
    console.error('Error in createUserWithEmailNotification:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
};
