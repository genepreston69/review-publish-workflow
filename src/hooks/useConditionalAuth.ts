
import { authConfig } from '@/config/authConfig';
import { useAuth } from '@/hooks/useAuth';
import { useMockAuth } from '@/hooks/useMockAuth';

export const useConditionalAuth = () => {
  const realAuth = useAuth();
  const mockAuth = useMockAuth();
  
  if (authConfig.useMockAuth) {
    return mockAuth;
  }
  
  return realAuth;
};
