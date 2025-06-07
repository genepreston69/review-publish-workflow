
export type UserRole = 'readonly' | 'edit' | 'publish' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  initials?: string;
  is_invited_user?: boolean;
  invited_at?: string;
}

export interface AssignmentRelation {
  editUserId: string;
  publishUserId: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  accepted_at?: string;
  token: string;
}
