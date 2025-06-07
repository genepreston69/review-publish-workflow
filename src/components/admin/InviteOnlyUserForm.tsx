
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/user';
import { useInviteManagement } from '@/hooks/useInviteManagement';
import { UserPlus, Loader2 } from 'lucide-react';

interface InviteOnlyUserFormProps {
  onInviteSent: () => void;
}

export const InviteOnlyUserForm = ({ onInviteSent }: InviteOnlyUserFormProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'readonly' as UserRole
  });
  const { toast } = useToast();
  const { sendInvitation } = useInviteManagement();

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
      const result = await sendInvitation(formData.email, formData.role);
      
      if (result.success) {
        // Reset form and close dialog
        setFormData({
          email: '',
          role: 'readonly'
        });
        setOpen(false);
        onInviteSent();
      }
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
      <DialogContent className="sm:max-w-md">
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
            <p className="text-sm text-gray-600">
              An invitation email will be sent to this address.
            </p>
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
                <SelectItem value="readonly">Read Only</SelectItem>
                <SelectItem value="edit">Editor</SelectItem>
                <SelectItem value="publish">Publisher</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
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
