
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAzureAuth } from '@/hooks/useAzureAuth';
import { UserRole } from '@/types/user';

interface DualAuthContextType {
  currentUser: any;
  userRole: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  authProvider: 'supabase' | 'azure';
}

const DualAuthContext = createContext<DualAuthContextType | undefined>(undefined);

export const useDualAuth = () => {
  const context = useContext(DualAuthContext);
  if (!context) {
    throw new Error('useDualAuth must be used within a DualAuthProvider');
  }
  return context;
};

interface DualAuthProviderProps {
  children: ReactNode;
  provider: 'supabase' | 'azure';
}

export const DualAuthProvider = ({ children, provider }: DualAuthProviderProps) => {
  const supabaseAuth = useAuth();
  const azureAuth = useAzureAuth();

  const activeAuth = provider === 'azure' ? azureAuth : supabaseAuth;

  const contextValue: DualAuthContextType = {
    currentUser: activeAuth.currentUser,
    userRole: activeAuth.userRole,
    isLoading: activeAuth.isLoading,
    signOut: activeAuth.signOut,
    authProvider: provider,
  };

  return (
    <DualAuthContext.Provider value={contextValue}>
      {children}
    </DualAuthContext.Provider>
  );
};
