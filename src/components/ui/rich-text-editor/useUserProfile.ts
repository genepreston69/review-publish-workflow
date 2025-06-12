
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getUserInitials } from '@/utils/trackingUtils';

export function useUserProfile() {
  const auth = useAuth();
  const [userInitials, setUserInitials] = useState<string>('U');

  useEffect(() => {
    const loadUserInitials = async () => {
      if (!auth?.currentUser?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', auth.currentUser.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          setUserInitials(getUserInitials(undefined, auth.currentUser.email));
          return;
        }

        const initials = getUserInitials(profile?.name, profile?.email || auth.currentUser.email);
        setUserInitials(initials);
      } catch (error) {
        console.error('Error loading user initials:', error);
        setUserInitials(getUserInitials(undefined, auth.currentUser.email));
      }
    };

    loadUserInitials();
  }, [auth?.currentUser]);

  return userInitials;
}
