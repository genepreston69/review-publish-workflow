
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { FacilityPoliciesGrid } from './policy/FacilityPoliciesGrid';
import { useAllUserPolicies } from '@/hooks/useAllUserPolicies';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function FacilityPolicies() {
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const { userRole } = useAuth();
  const { facilityPolicies, isLoadingPolicies, refetchPolicies } = useAllUserPolicies();
  const { toast } = useToast();

  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isSuperAdmin = userRole === 'super-admin';
  const isEditor = userRole === 'edit';

  const handleViewPolicy = (policyId: string) => {
    setViewingPolicyId(policyId);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  const handleUpdateStatus = async (policyId: string, newStatus: string) => {
    try {
      console.log('=== UPDATING FACILITY POLICY STATUS ===', { policyId, newStatus });
      
      const { error } = await supabase
        .from('Policies')
        .update({ status: newStatus })
        .eq('id', policyId);

      if (error) {
        console.error('Error updating policy status:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update policy status.",
        });
        return;
      }

      const statusMessage = newStatus === 'archived' 
        ? 'Policy archived successfully'
        : `Policy status updated to ${newStatus}`;

      toast({
        title: "Success",
        description: statusMessage,
      });

      // Refresh the policies list
      await refetchPolicies();
    } catch (error) {
      console.error('Error updating policy status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating the policy.",
      });
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    try {
      console.log('=== DELETING FACILITY POLICY ===', policyId);
      
      const { error } = await supabase
        .from('Policies')
        .delete()
        .eq('id', policyId);

      if (error) {
        console.error('Error deleting policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete policy.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Policy deleted successfully.",
      });

      // Refresh the policies list
      await refetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting the policy.",
      });
    }
  };

  console.log('=== ADMIN FACILITY POLICIES COMPONENT ===');
  console.log('Facility Policies count:', facilityPolicies.length);
  console.log('Is loading:', isLoadingPolicies);

  if (isLoadingPolicies) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {facilityPolicies.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-4 text-lg font-medium">No published facility policies found</h3>
          <p className="text-gray-500">No facility policies have been published yet.</p>
        </div>
      ) : (
        <FacilityPoliciesGrid
          policies={facilityPolicies}
          isEditor={isEditor}
          canPublish={canPublish}
          isSuperAdmin={isSuperAdmin}
          onView={handleViewPolicy}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeletePolicy}
          onRefresh={refetchPolicies}
        />
      )}

      {viewingPolicyId && (
        <PolicyViewModal
          policyId={viewingPolicyId}
          onClose={handleCloseView}
          onUpdateStatus={handleUpdateStatus}
          onRefresh={refetchPolicies}
        />
      )}
    </div>
  );
}
