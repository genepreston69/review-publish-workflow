
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Loader2 } from 'lucide-react';

interface PasswordChangeFormProps {
  userId: string;
  userEmail: string;
  isCurrentUser?: boolean;
}

export const PasswordChangeForm = ({ userId, userEmail, isCurrentUser = false }: PasswordChangeFormProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCurrentUser && !formData.currentPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your current password.",
      });
      return;
    }

    if (!formData.newPassword || formData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isCurrentUser) {
        // For current user, use Supabase auth to update password
        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (error) {
          throw error;
        }
      } else {
        // For admin changing other user's password, we need to use admin functions
        // This requires service role key, so we'll create an edge function for this
        const { error } = await supabase.functions.invoke('admin-reset-password', {
          body: {
            userId,
            newPassword: formData.newPassword
          }
        });

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Success",
        description: "Password updated successfully.",
      });

      // Reset form and close dialog
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      let errorMessage = "Failed to update password. Please try again.";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Current password is incorrect.";
      } else if (error.message?.includes('Password')) {
        errorMessage = "Password must be at least 6 characters long.";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Key className="w-3 h-3 mr-1" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isCurrentUser && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password *</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password *</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Enter new password (min 6 characters)"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
