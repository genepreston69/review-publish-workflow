
import { Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';
import { fetchUserRole } from './userRoleService';

export const initializeAuth = async (
  session: Session | null,
  setSession: (session: Session | null) => void,
  setCurrentUser: (user: any) => void,
  setUserRole: (role: UserRole | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  console.log('=== INITIALIZING AUTH ===', session?.user?.email);
  
  if (!session?.user) {
    setSession(null);
    setCurrentUser(null);
    setUserRole(null);
    setIsLoading(false);
    return;
  }

  setSession(session);
  setCurrentUser(session.user);

  // Try to fetch role with retries and timeout
  let attempts = 0;
  const maxAttempts = 3;
  const attemptDelay = 1000; // 1 second between attempts

  while (attempts < maxAttempts) {
    try {
      console.log(`=== ROLE FETCH ATTEMPT ${attempts + 1}/${maxAttempts} ===`);
      
      // Create a promise that races against timeout
      const rolePromise = fetchUserRole(session.user.id);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Role fetch timeout')), 5000)
      );

      const role = await Promise.race([rolePromise, timeoutPromise]);
      setUserRole(role);
      setIsLoading(false);
      console.log('=== AUTH INITIALIZATION SUCCESSFUL ===', role);
      return;

    } catch (error: any) {
      attempts++;
      console.error(`=== ROLE FETCH ATTEMPT ${attempts} FAILED ===`, error.message);
      
      if (attempts >= maxAttempts) {
        console.log('=== MAX ATTEMPTS REACHED, USING DEFAULT ROLE ===');
        setUserRole('read-only');
        setIsLoading(false);
        return;
      }
      
      // Wait before next attempt
      if (attempts < maxAttempts) {
        console.log(`=== WAITING ${attemptDelay}ms BEFORE RETRY ===`);
        await new Promise(resolve => setTimeout(resolve, attemptDelay));
      }
    }
  }
};
