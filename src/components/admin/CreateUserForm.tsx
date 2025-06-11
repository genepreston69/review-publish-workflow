
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

  const assignUserRole = async (userId: string, role: UserRole) => {
    console.log('=== ASSIGNING USER ROLE ===');
    console.log('User ID:', userId);
    console.log('Target role:', role);
    
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('=== ROLE ASSIGNMENT ERROR ===', error);
      throw error;
    }
    
    console.log('=== ROLE ASSIGNED SUCCESSFULLY ===');
  };

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
      console.log('=== STARTING USER CREATION PROCESS ===');
      console.log('Form data:', { 
        email: formData.email, 
        name: formData.name, 
        role: formData.role 
      });
      
      // Step 1: Create the user account
      console.log('=== CREATING NEW USER ACCOUNT ===');
      const { data: userData, error: createError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: formData.name
          }
        }
      });

      if (createError) {
        console.error('=== USER CREATION ERROR ===', createError);
        throw createError;
      }

      if (!userData.user) {
        console.error('=== NO USER RETURNED FROM SIGNUP ===');
        throw new Error('No user data returned from signup');
      }

      console.log('=== USER ACCOUNT CREATED ===');
      console.log('User ID:', userData.user.id);
      console.log('User email:', userData.user.email);
      
      // Step 2: Sign out the newly created user immediately
      console.log('=== SIGNING OUT NEW USER ===');
      await supabase.auth.signOut();
      
      // Step 3: Wait a moment for the profile to be created by the trigger
      console.log('=== WAITING FOR PROFILE CREATION ===');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Assign the role (admin session should be restored automatically)
      if (formData.role !== 'read-only') {
        try {
          await assignUserRole(userData.user.id, formData.role);
          console.log('=== ROLE ASSIGNMENT COMPLETE ===');
        } catch (roleError) {
          console.error('=== ROLE ASSIGNMENT FAILED ===', roleError);
          // Don't fail the entire process if role assignment fails
          toast({
            title: "User Created",
            description: `User ${formData.name} created successfully, but role assignment failed. Please update their role manually.`,
          });
          
          // Reset form and refresh list
          setFormData({
            email: '',
            name: '',
            role: 'read-only',
            password: ''
          });
          setOpen(false);
          onUserCreated();
          return;
        }
      }

      console.log('=== USER CREATION PROCESS COMPLETE ===');
      
      toast({
        title: "Success",
        description: `User ${formData.name} created successfully with ${formData.role} role.`,
      });

      // Reset form and close dialog
      setFormData({
        email: '',
        name: '',
        role: 'read-only',
        password: ''
      });
      setOpen(false);
      
      // Refresh the user list
      onUserCreated();
      
    } catch (error: any) {
      console.error('=== ERROR IN USER CREATION ===', error);
      
      let errorMessage = "Failed to create user. Please try again.";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "A user with this email address already exists.";
      } else if (error.message?.includes('Password')) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message?.includes('Email')) {
        errorMessage = "Please provide a valid email address.";
      } else if (error.message?.includes('Invalid email')) {
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
