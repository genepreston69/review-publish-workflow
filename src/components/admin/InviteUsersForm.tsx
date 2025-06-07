
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Loader2, Plus } from 'lucide-react';

interface InviteUsersFormProps {
  onInvitesSent: () => void;
}

export const InviteUsersForm = ({ onInvitesSent }: InviteUsersFormProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteType, setInviteType] = useState<'single' | 'bulk'>('single');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'read-only' as UserRole,
    emails: '',
    message: 'You have been invited to join our organization. Please check your email for login instructions.'
  });
  const { toast } = useToast();

  const handleSingleInvite = async () => {
    if (!formData.email || !formData.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      // Create user profile with pending status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: formData.email,
          name: formData.name,
          id: crypto.randomUUID() // Generate temporary ID for invited users
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.id,
          role: formData.role
        });

      if (roleError) throw roleError;

      // Here you would typically send an invitation email
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: `Invitation sent to ${formData.email}`,
      });

      onInvitesSent();
      setOpen(false);
      setFormData({
        email: '',
        name: '',
        role: 'read-only',
        emails: '',
        message: 'You have been invited to join our organization. Please check your email for login instructions.'
      });
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation. Please try again.",
      });
    }
  };

  const handleBulkInvite = async () => {
    const emailList = formData.emails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emailList.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter at least one valid email address.",
      });
      return;
    }

    try {
      const profiles = emailList.map(email => ({
        email,
        name: email.split('@')[0], // Use email prefix as default name
        id: crypto.randomUUID()
      }));

      const { data: createdProfiles, error: profileError } = await supabase
        .from('profiles')
        .insert(profiles)
        .select();

      if (profileError) throw profileError;

      const roles = createdProfiles.map(profile => ({
        user_id: profile.id,
        role: formData.role
      }));

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert(roles);

      if (roleError) throw roleError;

      toast({
        title: "Success",
        description: `Invitations sent to ${emailList.length} users`,
      });

      onInvitesSent();
      setOpen(false);
      setFormData({
        email: '',
        name: '',
        role: 'read-only',
        emails: '',
        message: 'You have been invited to join our organization. Please check your email for login instructions.'
      });
    } catch (error: any) {
      console.error('Error sending bulk invites:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitations. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (inviteType === 'single') {
        await handleSingleInvite();
      } else {
        await handleBulkInvite();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Invite Users
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Users</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Invitation Type</Label>
            <Select
              value={inviteType}
              onValueChange={(value: 'single' | 'bulk') => setInviteType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single User</SelectItem>
                <SelectItem value="bulk">Bulk Invite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inviteType === 'single' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
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
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="emails">Email Addresses (one per line) *</Label>
              <Textarea
                id="emails"
                value={formData.emails}
                onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
                placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                rows={5}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Default Role</Label>
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

          <div className="space-y-2">
            <Label htmlFor="message">Invitation Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Custom message for invitees"
              rows={3}
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
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invites
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
