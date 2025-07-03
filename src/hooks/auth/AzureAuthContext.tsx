
import { createContext, useContext } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { UserRole } from '@/types/user';

interface AzureAuthContextType {
  currentUser: AccountInfo | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUserRole?: () => Promise<void>;
}

export const AzureAuthContext = createContext<AzureAuthContextType | undefined>(undefined);

export const useAzureAuth = () => {
  const context = useContext(AzureAuthContext);
  if (context === undefined) {
    throw new Error('useAzureAuth must be used within an AzureAuthProvider');
  }
  return context;
};
