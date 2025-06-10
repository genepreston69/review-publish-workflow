
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateUserForm } from './CreateUserForm';
import { InviteUserForm } from './InviteUserForm';
import { UserTable } from './UserTable';
import { useUserManagement } from '@/hooks/useUserManagement';
import { User, Loader2 } from 'lucide-react';

export const UserManagement = () => {
  const { users, isLoading, refetch } = useUserManagement();

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
          <div className="flex gap-2">
            <InviteUserForm onUserInvited={refetch} />
            <CreateUserForm onUserCreated={refetch} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <UserTable users={users} onUserUpdated={refetch} />
      </CardContent>
    </Card>
  );
};
