
import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';
import { authConfig } from '@/config/authConfig';

interface MockAuthContextType {
  currentUser: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

interface MockAuthProviderProps {
  children: ReactNode;
}

export const MockAuthProvider = ({ children }: MockAuthProviderProps) => {
  const [userRole, setUserRole] = useState<UserRole>(authConfig.mockUser.role);
  const [isLoading] = useState(false);

  // Create mock user object that matches Supabase User interface
  const mockUser: User = {
    id: authConfig.mockUser.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: authConfig.mockUser.email,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {
      name: authConfig.mockUser.name
    },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Create mock session
  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser
  };

  const signOut = async () => {
    console.log('=== MOCK SIGN OUT ===');
    // In mock mode, signing out doesn't actually do anything
    // This preserves the interface for development
  };

  const switchRole = (role: UserRole) => {
    console.log('=== SWITCHING MOCK USER ROLE ===', role);
    setUserRole(role);
    authConfig.mockUser.role = role;
  };

  return (
    <MockAuthContext.Provider value={{ 
      currentUser: mockUser, 
      session: mockSession, 
      userRole, 
      isLoading, 
      signOut,
      switchRole
    }}>
      {children}
    </MockAuthContext.Provider>
  );
};
