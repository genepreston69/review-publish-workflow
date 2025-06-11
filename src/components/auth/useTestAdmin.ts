
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTestAdmin = () => {
  const { toast } = useToast();

  const createTestAdmin = async () => {
    try {
      console.log('=== CREATING TEST ADMIN ===');
      
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@test.com',
        password: 'admin123',
        options: {
          data: {
            name: 'Test Admin',
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('=== TEST ADMIN CREATION ERROR ===', error);
        toast({
          variant: "destructive",
          title: "Failed to create test admin",
          description: error.message,
        });
      } else {
        console.log('=== TEST ADMIN CREATED ===', data);
        
        // Wait a moment for the profile to be created
        setTimeout(async () => {
          if (data.user) {
            const { error: roleError } = await supabase
              .from('profiles')
              .update({ role: 'super-admin' })
              .eq('id', data.user.id);
              
            if (roleError) {
              console.error('=== ROLE UPDATE ERROR ===', roleError);
            } else {
              console.log('=== TEST ADMIN ROLE UPDATED ===');
            }
          }
        }, 1000);
        
        toast({
          title: "Test admin created!",
          description: "Email: admin@test.com, Password: admin123",
        });
      }
    } catch (error) {
      console.error('=== UNEXPECTED TEST ADMIN ERROR ===', error);
    }
  };

  return { createTestAdmin };
};
