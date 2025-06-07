
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleBadge } from '@/components/RoleBadge';
import { UserStatusBadge } from './UserStatusBadge';
import { UserRoleSelect } from './UserRoleSelect';
import { UserDeleteButton } from './UserDeleteButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types/user';
import { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: UserRole;
  status?: 'active' | 'pending' | 'inactive' | 'invited';
}

interface UserTableProps {
  users: UserWithRole[];
  onUserUpdated: () => void;
}

export const UserTable = ({ users, onUserUpdated }: UserTableProps) => {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const { toast } = useToast();

  const startEdit = (user: UserWithRole) => {
    setEditingUser(user.id);
    setEditForm({ name: user.name, email: user.email });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '' });
  };

  const saveEdit = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          email: editForm.email
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User information updated successfully.",
      });

      setEditingUser(null);
      onUserUpdated();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user information.",
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {editingUser === user.id ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full"
                  />
                ) : (
                  <div className="font-medium">{user.name}</div>
                )}
              </TableCell>
              <TableCell>
                {editingUser === user.id ? (
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full"
                    type="email"
                  />
                ) : (
                  user.email
                )}
              </TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <UserStatusBadge status={user.status || 'active'} />
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {editingUser === user.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => saveEdit(user.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      
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
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
