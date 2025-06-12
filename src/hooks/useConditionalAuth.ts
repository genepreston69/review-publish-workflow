
import { authConfig } from '@/config/authConfig';
import { useAuth } from '@/hooks/useAuth';
import { useMockAuth } from '@/hooks/useMockAuth';

export const useConditionalAuth = () => {
  if (authConfig.useMockAuth) {
    return useMockAuth();
  }
  
  return useAuth();
};
