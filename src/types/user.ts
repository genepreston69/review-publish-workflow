
export type UserRole = 'read-only' | 'edit' | 'publish' | 'super-admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  initials?: string;
}

export interface AssignmentRelation {
  editUserId: string;
  publishUserId: string;
}
