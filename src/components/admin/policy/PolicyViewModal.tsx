
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, X, FileText, Calendar, User, RotateCcw, Edit } from 'lucide-react';

interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  policy_text: string | null;
  procedure: string | null;
  purpose: string | null;
  reviewer: string | null;
  status: string | null;
  policy_type: string | null;
  created_at: string;
}

interface PolicyViewModalProps {
  policyId: string;
  onClose: () => void;
  onEdit?: (policyId: string) => void;
  onUpdateStatus?: (policyId: string, newStatus: string) => void;
}

// Function to strip HTML tags from text but preserve structure
const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export function PolicyViewModal({ policyId, onClose, onEdit, onUpdateStatus }: PolicyViewModalProps) {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState<Policy | null>(null);

  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isEditor = userRole === 'edit';

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        setIsLoading(true);
        console.log('=== LOADING POLICY FOR VIEW ===', policyId);

        const { data, error } = await supabase
          .from('Policies')
          .select('*')
          .eq('id', policyId)
          .single();

        if (error) {
          console.error('Error loading policy:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load policy for viewing.",
          });
          onClose();
          return;
        }

        console.log('=== POLICY LOADED FOR VIEW ===', data);
        setPolicy(data);
      } catch (error) {
        console.error('Error loading policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load policy for viewing.",
        });
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (policyId) {
      loadPolicy();
    }
  }, [policyId, toast, onClose]);

  const handleReturnToDraft = async () => {
    if (!policy || !onUpdateStatus) return;

    try {
      await onUpdateStatus(policy.id, 'draft');
      toast({
        title: "Success",
        description: "Policy returned to draft status.",
      });
      onClose();
    } catch (error) {
      console.error('Error returning policy to draft:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to return policy to draft status.",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Loading policy...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!policy) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Policy Not Found</h3>
              <p className="text-gray-500">The requested policy could not be found.</p>
              <Button onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                {policy.name || 'Untitled Policy'}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-2">
                {policy.policy_number && (
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {policy.policy_number}
                  </span>
                )}
                {policy.policy_type && (
                  <span className="text-sm text-gray-600">
                    Type: {policy.policy_type}
                  </span>
                )}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Policy Metadata */}
          <div className="flex items-center gap-6 text-sm text-gray-500 border-b pb-4">
            {policy.reviewer && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Reviewer: {stripHtml(policy.reviewer)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(policy.created_at).toLocaleDateString()}</span>
            </div>
            {policy.status && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                policy.status === 'published' ? 'bg-green-100 text-green-800' :
                policy.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                policy.status === 'under-review' || policy.status === 'under review' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {policy.status}
              </span>
            )}
          </div>

          {/* Purpose Section */}
          {policy.purpose && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Purpose</h3>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: policy.purpose }} />
              </div>
            </div>
          )}

          {/* Policy Text Section */}
          {policy.policy_text && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Policy</h3>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: policy.policy_text }} />
              </div>
            </div>
          )}

          {/* Procedure Section */}
          {policy.procedure && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Procedure</h3>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: policy.procedure }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <div className="flex gap-2">
            {/* Edit Button */}
            {onEdit && (
              (isEditor && policy.status === 'draft') ||
              (canPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review'))
            ) && (
              <Button variant="outline" onClick={() => onEdit(policy.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Policy
              </Button>
            )}

            {/* Return to Draft Button */}
            {canPublish && onUpdateStatus && (policy.status === 'under-review' || policy.status === 'under review') && (
              <Button variant="outline" onClick={handleReturnToDraft}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Return to Draft
              </Button>
            )}
          </div>

          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
