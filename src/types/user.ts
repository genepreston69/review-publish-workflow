
export type UserRole = 'read-only' | 'edit' | 'publish';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AssignmentRelation {
  editUserId: string;
  publishUserId: string;
}
