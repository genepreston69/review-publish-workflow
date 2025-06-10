
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
    password: '',
    name: '',
    role: 'read-only' as UserRole
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('=== CREATING NEW USER ===');
      console.log('Email:', formData.email);
      console.log('Name:', formData.name);
      console.log('Role:', formData.role);

      // Try to create user with admin API first
      let authData;
      let useAdminAPI = true;
      
      try {
        const { data, error: adminError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          user_metadata: {
            name: formData.name || formData.email
          },
          email_confirm: true
        });
        
        if (adminError) throw adminError;
        authData = data;
        console.log('User created with admin API:', authData.user?.id);
      } catch (adminError) {
        console.log('Admin API failed, falling back to regular signup:', adminError);
        useAdminAPI = false;
        
        // Fall back to regular signup
        const { data, error: signupError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name || formData.email
            }
          }
        });
        
        if (signupError) throw signupError;
        authData = data;
        console.log('User created with regular signup:', authData.user?.id);
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned');
      }

      const userId = authData.user.id;

      // Wait a moment for any triggers to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the profile with the role - the profile should already exist from the trigger
      console.log('Setting user role to:', formData.role);
      
      const { error: roleError } = await supabase
        .from('profiles')
        .update({
          role: formData.role,
          name: formData.name || formData.email
        })
        .eq('id', userId);

      if (roleError) {
        console.error('Profile update error:', roleError);
        throw new Error(`Failed to set user role: ${roleError.message}`);
      }

      console.log('Role successfully set in profiles table');
      console.log('=== USER CREATION SUCCESS ===');

      let successMessage = `User ${formData.email} created successfully with ${formData.role} role.`;
      if (!useAdminAPI) {
        successMessage += ' The user will need to confirm their email before they can log in.';
      }

      toast({
        title: "Success",
        description: successMessage,
      });

      // Reset form and close dialog
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'read-only'
      });
      setOpen(false);
      onUserCreated();
      
    } catch (error: any) {
      console.error('=== USER CREATION FAILED ===', error);
      
      let errorMessage = "Failed to create user. Please try again.";
      
      if (error.message?.includes('already exists') || error.message?.includes('already registered')) {
        errorMessage = "A user with this email already exists.";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "Please provide a valid email address.";
      } else if (error.message?.includes('weak password')) {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.message?.includes('role')) {
        errorMessage = `Failed to assign role: ${error.message}`;
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
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
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
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
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
