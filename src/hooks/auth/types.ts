
import { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

export interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUserRole?: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
