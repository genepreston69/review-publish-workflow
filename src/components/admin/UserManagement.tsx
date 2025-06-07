
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InviteOnlyUserForm } from './InviteOnlyUserForm';
import { UserTable } from './UserTable';
import { UserSearchAndFilter } from './UserSearchAndFilter';
import { useUserManagement } from '@/hooks/useUserManagement';
import { User, Loader2, Upload } from 'lucide-react';
import { UserRole } from '@/types/user';

export const UserManagement = () => {
  const { users, isLoading, fetchUsers } = useUserManagement();
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Update filtered users when users data changes
  React.useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter !== 'active') {
        filtered = [];
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterRole = (role: UserRole | 'all') => {
    setRoleFilter(role);
  };

  const handleFilterStatus = (status: string) => {
    setStatusFilter(status);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

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
            User Management (Invite-Only)
          </CardTitle>
          <div className="flex gap-2">
            <InviteOnlyUserForm onInviteSent={fetchUsers} />
            <Button variant="outline" disabled>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import (Coming Soon)
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <UserSearchAndFilter
          onSearch={handleSearch}
          onFilterRole={handleFilterRole}
          onFilterStatus={handleFilterStatus}
          onClearFilters={handleClearFilters}
        />
        
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
        
        <UserTable users={filteredUsers} onUserUpdated={fetchUsers} />
      </CardContent>
    </Card>
  );
};
