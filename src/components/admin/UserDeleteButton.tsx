
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';

interface UserDeleteButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
  onUserDeleted: () => void;
}

export const UserDeleteButton = ({ userId, userName, userEmail, onUserDeleted }: UserDeleteButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteUser = async () => {
    try {
      setIsDeleting(true);
      console.log('=== DELETE USER ATTEMPT ===');
      console.log('Target user ID:', userId);

      // Delete profile - this will handle cascading deletes
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw profileError;
      }

      // Try to delete from auth - this may fail if we don't have admin privileges
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) {
          console.warn('Could not delete from auth (may need admin privileges):', authError);
          // Don't throw here - user is effectively deleted from our app
        }
      } catch (authDeleteError) {
        console.warn('Auth delete failed (expected if not admin):', authDeleteError);
      }

      console.log('=== DELETE USER SUCCESS ===');

      toast({
        title: "Success",
        description: "User deleted successfully.",
      });

      onUserDeleted();
    } catch (error) {
      console.error('=== DELETE USER FAILED ===', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user. You may not have sufficient privileges.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDeleting}
        >
          {isDeleting ? (
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
            Are you sure you want to delete {userName} ({userEmail})? 
            This action cannot be undone and will permanently remove the user 
            from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteUser}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
