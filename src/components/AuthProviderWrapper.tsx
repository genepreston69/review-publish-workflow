
import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { MockAuthProvider } from '@/hooks/useMockAuth';
import { authConfig } from '@/config/authConfig';

interface AuthProviderWrapperProps {
  children: ReactNode;
}

export const AuthProviderWrapper = ({ children }: AuthProviderWrapperProps) => {
  if (authConfig.useMockAuth) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  
  return <AuthProvider>{children}</AuthProvider>;
};
