
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';
import { Policy } from './policy/types';
import { Eye, Send, RefreshCw, AlertCircle, Lock } from 'lucide-react';

export function PublishInterface() {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const { policies, isLoadingPolicies, updatePolicyStatus, fetchPolicies } = usePolicies();
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const [assignedEditorIds, setAssignedEditorIds] = useState<string[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [hasPublishAccess, setHasPublishAccess] = useState(false);

  // Check if current user is assigned as a publisher
  useEffect(() => {
    const checkPublishAccess = async () => {
      if (!currentUser) {
        setIsLoadingAssignments(false);
        return;
      }

      try {
        const { data: assignments, error } = await supabase
          .from('assignment_relations')
          .select('edit_user_id')
          .eq('publish_user_id', currentUser.id);

        if (error) {
          console.error('Error checking publish assignments:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load publishing assignments.",
          });
        } else {
          const editorIds = assignments?.map(a => a.edit_user_id) || [];
          setAssignedEditorIds(editorIds);
          setHasPublishAccess(editorIds.length > 0 || userRole === 'super-admin');
        }
      } catch (error) {
        console.error('Error checking assignments:', error);
      } finally {
        setIsLoadingAssignments(false);
      }
    };

    checkPublishAccess();
  }, [currentUser, userRole, toast]);

  // Filter policies that are approved and created by assigned editors
  const publishablePolicies = policies.filter(policy => {
    if (policy.status !== 'approved') return false;
    
    // Super-admins can publish any approved policy
    if (userRole === 'super-admin') return true;
    
    // Regular publishers can only publish policies from their assigned editors
    return assignedEditorIds.includes(policy.creator_id || '');
  });

  const handleViewPolicy = (policyId: string) => {
    setViewingPolicyId(policyId);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  const handlePublishPolicy = async (policyId: string) => {
    console.log('=== PUBLISHING POLICY ===', policyId);
    
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;

    // Validate assignment if not super-admin
    if (userRole !== 'super-admin' && !assignedEditorIds.includes(policy.creator_id || '')) {
      toast({
        variant: "destructive",
        title: "Publishing Not Allowed",
        description: "You can only publish policies from editors assigned to you.",
      });
      return;
    }

    try {
      await updatePolicyStatus(policyId, 'published');
    } catch (error) {
      console.error('Error publishing policy:', error);
    }
  };

  const handleRefresh = () => {
    console.log('=== REFRESHING PUBLISH INTERFACE ===');
    fetchPolicies();
  };

  if (isLoadingAssignments) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  if (!hasPublishAccess) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Publishing Access</h3>
            <p className="text-gray-600 text-center max-w-md">
              You don't have any editor assignments. Contact an administrator to be assigned as a publisher for specific editors.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Publish Interface</h2>
          <p className="text-muted-foreground">
            Publish approved policies to make them live. You can only publish policies from editors assigned to you.
          </p>
          {publishablePolicies.length > 0 && (
            <div className="text-sm text-gray-600 mt-2">
              <p>You have {publishablePolicies.length} {publishablePolicies.length === 1 ? 'policy' : 'policies'} ready to publish</p>
              {userRole !== 'super-admin' && (
                <p>Assigned to {assignedEditorIds.length} {assignedEditorIds.length === 1 ? 'editor' : 'editors'}</p>
              )}
            </div>
          )}
        </div>
        <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {publishablePolicies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Send className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No policies to publish</h3>
            <p className="text-gray-600 text-center">
              No approved policies are available for publishing from your assigned editors.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {publishablePolicies.map((policy) => (
            <Card key={policy.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{policy.name || 'Untitled Policy'}</h3>
                    <Badge variant="default" className="bg-green-600">
                      Approved
                    </Badge>
                    <Badge variant="outline">{policy.policy_type}</Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p>Policy Number: {policy.policy_number || 'Not assigned'}</p>
                    <p>Approved: {policy.updated_at ? new Date(policy.updated_at).toLocaleDateString() : 'Unknown'}</p>
                    <p>Creator: {policy.creator?.name || 'Unknown'}</p>
                    {policy.reviewer && <p>Reviewer: {policy.reviewer}</p>}
                  </div>

                  {policy.purpose && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Purpose:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{policy.purpose}</p>
                    </div>
                  )}

                  {!assignedEditorIds.includes(policy.creator_id || '') && userRole !== 'super-admin' && (
                    <div className="mb-3 p-3 bg-red-50 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Assignment Validation Failed</p>
                        <p className="text-sm text-red-700">You are not assigned to publish policies from this editor.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPolicy(policy.id)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handlePublishPolicy(policy.id)}
                    disabled={!assignedEditorIds.includes(policy.creator_id || '') && userRole !== 'super-admin'}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                    Publish
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {viewingPolicyId && (
        <PolicyViewModal
          policyId={viewingPolicyId}
          onClose={handleCloseView}
          onUpdateStatus={async (policyId, newStatus, comment) => {
            if (newStatus === 'published') {
              await handlePublishPolicy(policyId);
            } else {
              await updatePolicyStatus(policyId, newStatus, comment);
            }
          }}
          onRefresh={fetchPolicies}
        />
      )}
    </div>
  );
}
