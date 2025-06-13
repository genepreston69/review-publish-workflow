
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';
import { ReactNode } from 'react';

export interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
