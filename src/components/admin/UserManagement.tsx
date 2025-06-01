import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { RoleBadge } from '@/components/RoleBadge';
import { CreateUserForm } from './CreateUserForm';
import { UserRole } from '@/types/user';
import { User, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: UserRole;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser, userRole } = useAuth();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles: UserWithRole[] = profiles.map(profile => {
        const userRole = userRoles.find(role => role.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role as UserRole || 'read-only'
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      console.log('=== ROLE UPDATE ATTEMPT ===');
      console.log('Current user ID:', currentUser?.id);
      console.log('Current user role:', userRole);
      console.log('Target user ID:', userId);
      console.log('New role:', newRole);
      
      // Check if current user is super admin
      const { data: currentUserRoles, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser?.id);
      
      console.log('Current user roles from DB:', currentUserRoles);
      console.log('Role check error:', roleCheckError);
      
      // Use upsert approach which handles both insert and update
      const { error: upsertError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: userId, role: newRole },
          { 
            onConflict: 'user_id,role',
            ignoreDuplicates: false 
          }
        );

      if (upsertError) {
        console.error('Upsert failed, trying delete then insert approach:', upsertError);
        
        // If upsert fails, try the delete-then-insert approach
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Error deleting existing roles:', deleteError);
          throw deleteError;
        }

        // Then insert the new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (insertError) {
          console.error('Error inserting new role:', insertError);
          throw insertError;
        }
      }

      console.log('=== ROLE UPDATE SUCCESS ===');
      
      toast({
        title: "Success",
        description: "User role updated successfully.",
      });

      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error('=== ROLE UPDATE FAILED ===', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role. You may not have sufficient privileges.",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setDeletingUserId(userId);

      // First delete user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      // Then delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Finally delete from auth (this requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) throw authError;

      toast({
        title: "Success",
        description: "User deleted successfully.",
      });

      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user. You may not have sufficient privileges.",
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
                      <Select
                        value={user.role}
                        onValueChange={(value: UserRole) => updateUserRole(user.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read-only">Read Only</SelectItem>
                          <SelectItem value="edit">Editor</SelectItem>
                          <SelectItem value="publish">Publisher</SelectItem>
                          <SelectItem value="super-admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingUserId === user.id}
                          >
                            {deletingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.name} ({user.email})? 
                              This action cannot be undone and will permanently remove the user 
                              from the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
      </CardContent>
    </Card>
  );
};
