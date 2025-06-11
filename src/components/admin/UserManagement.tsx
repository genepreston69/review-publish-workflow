
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateUserForm } from './CreateUserForm';
import { UserTable } from './UserTable';
import { CreateMissingProfiles } from './CreateMissingProfiles';
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
    <div className="space-y-6">
      {/* Show missing profiles helper if we have fewer than expected users */}
      {users.length < 3 && (
        <CreateMissingProfiles onProfilesCreated={fetchUsers} />
      )}
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Management ({users.length} users)
            </CardTitle>
            <CreateUserForm onUserCreated={fetchUsers} />
          </div>
        </CardHeader>
        <CardContent>
          <UserTable users={users} onUserUpdated={fetchUsers} />
        </CardContent>
      </Card>
    </div>
  );
};
