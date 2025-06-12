
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/user';
import { useConditionalAuth } from '@/hooks/useConditionalAuth';

interface UserRoleSelectProps {
  userId: string;
  currentRole: UserRole;
  onRoleUpdated: () => void;
}

export const UserRoleSelect = ({ userId, currentRole, onRoleUpdated }: UserRoleSelectProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { currentUser, userRole } = useConditionalAuth();

  const updateUserRole = async (newRole: UserRole) => {
    try {
      setIsUpdating(true);
      console.log('=== ROLE UPDATE ATTEMPT IN PROFILES ===');
      console.log('Current user ID:', currentUser?.id);
      console.log('Current user role:', userRole);
      console.log('Target user ID:', userId);
      console.log('New role:', newRole);
      
      // Update role directly in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating role in profiles:', updateError);
        throw updateError;
      }

      console.log('=== ROLE UPDATE SUCCESS IN PROFILES ===');
      
      toast({
        title: "Success",
        description: "User role updated successfully.",
      });

      onRoleUpdated();
    } catch (error) {
      console.error('=== ROLE UPDATE FAILED IN PROFILES ===', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role. You may not have sufficient privileges.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentRole}
      onValueChange={(value: UserRole) => updateUserRole(value)}
      disabled={isUpdating}
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
  );
};
