
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleBadge } from '@/components/RoleBadge';
import { UserRoleSelect } from './UserRoleSelect';
import { UserDeleteButton } from './UserDeleteButton';
import { EditUserNameForm } from './EditUserNameForm';
import { PasswordChangeForm } from './PasswordChangeForm';
import { User } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';

interface UserTableProps {
  users: User[];
  onUserUpdated: () => void;
}

export const UserTable = ({ users, onUserUpdated }: UserTableProps) => {
  const { currentUser } = useAuth();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="group">
              <TableCell>
                <EditUserNameForm
                  userId={user.id}
                  currentName={user.name}
                  onNameUpdated={onUserUpdated}
                />
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserRoleSelect
                    userId={user.id}
                    currentRole={user.role}
                    onRoleUpdated={onUserUpdated}
                  />
                  
                  <PasswordChangeForm
                    userId={user.id}
                    userEmail={user.email}
                    isCurrentUser={user.id === currentUser?.id}
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
              <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
