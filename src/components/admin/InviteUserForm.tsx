
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface InviteUserFormProps {
  onUserInvited: () => void;
}

export const InviteUserForm = ({ onUserInvited }: InviteUserFormProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'read-only' as UserRole
  });
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('=== SENDING INVITATION ===', formData.email);

      // Get current user's profile for the invitation
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', currentUser?.id)
        .single();

      if (profileError) {
        throw new Error('Failed to get user profile');
      }

      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          email: formData.email,
          invited_by: currentUser?.id
        })
        .select('token')
        .single();

      if (inviteError) {
        console.error('Invitation creation error:', inviteError);
        throw inviteError;
      }

      console.log('Invitation created:', invitation);

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: formData.email,
          inviterName: profile.name
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        throw emailError;
      }

      toast({
        title: "Success",
        description: `Invitation sent to ${formData.email} successfully.`,
      });

      // Reset form and close dialog
      setFormData({
        email: '',
        role: 'read-only'
      });
      setOpen(false);
      onUserInvited();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      
      let errorMessage = "Failed to send invitation. Please try again.";
      
      if (error.message?.includes('already exists')) {
        errorMessage = "An invitation has already been sent to this email address.";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "Please provide a valid email address.";
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
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Initial Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read-only">Read Only</SelectItem>
                <SelectItem value="edit">Editor</SelectItem>
                <SelectItem value="publish">Publisher</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
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
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
