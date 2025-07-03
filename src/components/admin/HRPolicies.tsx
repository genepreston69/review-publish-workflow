
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { FacilityPoliciesGrid } from './policy/FacilityPoliciesGrid';
import { PolicyList } from './policy/PolicyList';
import { useAllUserPolicies } from '@/hooks/useAllUserPolicies';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid, List, LayoutGrid } from 'lucide-react';

export function HRPolicies() {
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const { userRole } = useAuth();
  const { hrPolicies, isLoadingPolicies, refetchPolicies } = useAllUserPolicies();
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
      console.log('=== UPDATING HR POLICY STATUS ===', { policyId, newStatus });
      
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
      console.log('=== DELETING HR POLICY ===', policyId);
      
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

  console.log('=== ADMIN HR POLICIES COMPONENT ===');
  console.log('HR Policies count:', hrPolicies.length);
  console.log('Is loading:', isLoadingPolicies);

  if (isLoadingPolicies) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">HR Policies</h2>
          <p className="text-muted-foreground">
            Human resources policies and procedures
          </p>
          {hrPolicies.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {hrPolicies.length} published HR {hrPolicies.length === 1 ? 'policy' : 'policies'}
            </p>
          )}
        </div>

        {/* View Mode Toggle - Always show when there are policies */}
        {hrPolicies.length > 0 && (
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list' | 'compact')}>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid className="h-4 w-4" />
                Grid
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
                List
              </ToggleGroupItem>
              <ToggleGroupItem value="compact" aria-label="Compact view">
                <LayoutGrid className="h-4 w-4" />
                Compact
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </div>

      {hrPolicies.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-4 text-lg font-medium">No published HR policies found</h3>
          <p className="text-gray-500">No HR policies have been published yet.</p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <PolicyList
              policies={hrPolicies}
              isLoading={isLoadingPolicies}
              isEditor={isEditor}
              canPublish={canPublish}
              onUpdateStatus={handleUpdateStatus}
              onEdit={() => {}} // HR policies don't have edit functionality in this context
              onView={handleViewPolicy}
              onDelete={handleDeletePolicy}
            />
          ) : (
            <FacilityPoliciesGrid
              policies={hrPolicies}
              isEditor={isEditor}
              canPublish={canPublish}
              isSuperAdmin={isSuperAdmin}
              compact={viewMode === 'compact'}
              onView={handleViewPolicy}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeletePolicy}
              onRefresh={refetchPolicies}
              hideHeader={true}
            />
          )}
        </>
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
