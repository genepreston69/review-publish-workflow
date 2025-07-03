
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export const useConditionalAuth = () => {
  const auth = useAuth();
  const { userRole, isLoading: roleLoading } = useUserRole();
  
  return {
    ...auth,
    userRole,
    isLoading: auth.isLoading || roleLoading
  };
};
