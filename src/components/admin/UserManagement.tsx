
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateUserForm } from './CreateUserForm';
import { UserTable } from './UserTable';
import { useUserManagement } from '@/hooks/useUserManagement';
import { User, Loader2 } from 'lucide-react';

export const UserManagement = () => {
  const { users, isLoading, fetchUsers } = useUserManagement();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Management
          </CardTitle>
          <CreateUserForm onUserCreated={fetchUsers} />
        </div>
      </CardHeader>
      <CardContent>
        <UserTable users={users} onUserUpdated={fetchUsers} />
      </CardContent>
    </Card>
  );
};
