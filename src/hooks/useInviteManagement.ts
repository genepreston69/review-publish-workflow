
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole, UserInvitation } from '@/types/user';

export const useInviteManagement = () => {
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }

      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load invitations.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvitation = async (email: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .insert({
          email,
          role,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('An invitation has already been sent to this email address.');
        }
        throw error;
      }

      toast({
        title: "Success",
        description: `Invitation sent to ${email}`,
      });

      fetchInvitations();
      return { success: true };
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send invitation.",
      });
      return { success: false, error: error.message };
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation cancelled successfully.",
      });

      fetchInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel invitation.",
      });
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      // Reset the expiration date to 7 days from now
      const { error } = await supabase
        .from('user_invitations')
        .update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation resent successfully.",
      });

      fetchInvitations();
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend invitation.",
      });
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return {
    invitations,
    isLoading,
    fetchInvitations,
    sendInvitation,
    cancelInvitation,
    resendInvitation
  };
};
