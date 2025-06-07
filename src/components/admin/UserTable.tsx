
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleBadge } from '@/components/RoleBadge';
import { UserRoleSelect } from './UserRoleSelect';
import { UserDeleteButton } from './UserDeleteButton';
import { UserRole } from '@/types/user';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: UserRole;
}

interface UserTableProps {
  users: UserWithRole[];
  onUserUpdated: () => void;
}

export const UserTable = ({ users, onUserUpdated }: UserTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserRoleSelect
                    userId={user.id}
                    currentRole={user.role}
                    onRoleUpdated={onUserUpdated}
                  />
                  
                  <UserDeleteButton
                    userId={user.id}
                    userName={user.name}
                    userEmail={user.email}
                    onUserDeleted={onUserUpdated}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
