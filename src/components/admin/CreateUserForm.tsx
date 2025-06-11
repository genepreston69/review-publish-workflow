
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

interface CreateUserFormProps {
  onUserCreated: () => void;
}

export const CreateUserForm = ({ onUserCreated }: CreateUserFormProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'read-only' as UserRole,
    password: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('=== STARTING ADMIN USER CREATION ===');
      console.log('Form data:', { 
        email: formData.email, 
        name: formData.name, 
        role: formData.role 
      });
      
      // Store the current session before creating the new user
      console.log('=== STORING CURRENT SESSION ===');
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('Current session stored:', !!currentSession.session);
      
      // Use the admin API to create user without signing them in
      console.log('=== CALLING ADMIN USER CREATE ===');
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true, // Skip email confirmation for admin-created users
        user_metadata: {
          name: formData.name
        }
      });

      console.log('=== ADMIN USER CREATE RESPONSE ===');
      console.log('User data:', userData);
      console.log('Create error:', createError);

      if (createError) {
        console.error('=== ADMIN USER CREATE ERROR ===', createError);
        throw createError;
      }

      if (!userData.user) {
        console.error('=== NO USER RETURNED FROM ADMIN CREATE ===');
        throw new Error('No user data returned from admin create');
      }

      console.log('=== USER CREATED SUCCESSFULLY ===');
      console.log('User ID:', userData.user.id);
      console.log('User email:', userData.user.email);
      
      // Restore the admin session if it was changed
      console.log('=== CHECKING IF SESSION NEEDS RESTORATION ===');
      const { data: newSession } = await supabase.auth.getSession();
      
      if (currentSession.session && (!newSession.session || newSession.session.user.id !== currentSession.session.user.id)) {
        console.log('=== RESTORING ADMIN SESSION ===');
        await supabase.auth.setSession({
          access_token: currentSession.session.access_token,
          refresh_token: currentSession.session.refresh_token
        });
        console.log('=== ADMIN SESSION RESTORED ===');
      } else {
        console.log('=== SESSION UNCHANGED ===');
      }
      
      // Wait a moment for the profile to be created by the trigger
      console.log('=== WAITING FOR PROFILE CREATION ===');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the role if different from default
      if (formData.role !== 'read-only') {
        console.log('=== UPDATING USER ROLE ===');
        console.log('Target role:', formData.role);
        
        const { error: roleError } = await supabase
          .from('profiles')
          .update({ role: formData.role })
          .eq('id', userData.user.id);

        if (roleError) {
          console.error('=== ROLE UPDATE ERROR ===', roleError);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "User created but role assignment failed. Please update manually.",
          });
        } else {
          console.log('=== ROLE UPDATED SUCCESSFULLY ===');
        }
      }

      console.log('=== USER CREATION PROCESS COMPLETE ===');
      
      toast({
        title: "Success",
        description: `User ${formData.name} created successfully.`,
      });

      // Reset form and close dialog
      setFormData({
        email: '',
        name: '',
        role: 'read-only',
        password: ''
      });
      setOpen(false);
      onUserCreated();
      
    } catch (error: any) {
      console.error('=== FATAL ERROR IN USER CREATION ===', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      
      let errorMessage = "Failed to create user. Please try again.";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "A user with this email address already exists.";
      } else if (error.message?.includes('Password')) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message?.includes('Email')) {
        errorMessage = "Please provide a valid email address.";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Please provide a valid email address.";
      } else if (error.message?.includes('Admin API')) {
        errorMessage = "You don't have permission to create users. Please contact your system administrator.";
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
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password (min 6 characters)"
              required
              minLength={6}
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
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
