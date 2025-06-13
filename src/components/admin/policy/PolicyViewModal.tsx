
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePolicyDuplication } from '@/hooks/usePolicyDuplication';
import { PolicyViewLoading } from './PolicyViewLoading';
import { PolicyNotFound } from './PolicyNotFound';
import { PolicyViewHeader } from './PolicyViewHeader';
import { PolicyViewMetadata } from './PolicyViewMetadata';
import { PolicyViewContent } from './PolicyViewContent';
import { PolicyViewActions } from './PolicyViewActions';
import { PolicyVersionHistory } from './PolicyVersionHistory';
import { PolicyCommentSection } from './PolicyCommentSection';
import { generatePolicyPrintTemplate } from './policyPrintUtils';
import { Policy } from './types';
import { Printer } from 'lucide-react';

interface PolicyViewModalProps {
  policyId: string;
  onClose: () => void;
  onEdit?: (policyId: string) => void;
  onUpdateStatus?: (policyId: string, newStatus: string) => void;
  onRefresh?: () => void;
}

export function PolicyViewModal({ policyId, onClose, onEdit, onUpdateStatus, onRefresh }: PolicyViewModalProps) {
  const { toast } = useToast();
  const { archiveOldVersions } = usePolicyDuplication();
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [viewingVersionId, setViewingVersionId] = useState<string>(policyId);

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        setIsLoading(true);
        console.log('=== LOADING POLICY FOR VIEW ===', viewingVersionId);

        const { data, error } = await supabase
          .from('Policies')
          .select(`
            *,
            creator:creator_id(id, name, email),
            publisher:publisher_id(id, name, email)
          `)
          .eq('id', viewingVersionId)
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

    if (viewingVersionId) {
      loadPolicy();
    }
  }, [viewingVersionId, toast, onClose]);

  const handlePrintPolicy = () => {
    if (!policy) return;

    try {
      const printHtml = generatePolicyPrintTemplate(
        policy.name || 'Untitled Policy',
        policy.policy_number || 'N/A',
        policy.policy_type || 'N/A',
        policy.policy_text || '',
        policy.reviewer || 'Unknown',
        policy.created_at,
        policy.status || 'Unknown'
      );

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printHtml);
        printWindow.document.close();
        
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };

        toast({
          title: "Success",
          description: "Policy print dialog opened.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to open print window. Please check your browser's popup settings.",
        });
      }
    } catch (error) {
      console.error('Error printing policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to print policy.",
      });
    }
  };

  const handleReturnToDraft = async () => {
    if (!policy || !onUpdateStatus) return;

    console.log('=== RETURNING POLICY TO DRAFT ===', policy.id);
    try {
      await onUpdateStatus(policy.id, 'draft');
      const message = policy.status === 'published' 
        ? 'Policy returned to draft status for editing'
        : 'Policy returned to draft status';
      
      toast({
        title: "Success",
        description: message,
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

  const handlePublish = async () => {
    if (!policy || !onUpdateStatus) return;

    console.log('=== PUBLISHING POLICY WITH VERSIONING ===', policy.id);
    try {
      // Archive old versions before publishing
      const parentPolicyId = policy.parent_policy_id || policy.id;
      await archiveOldVersions(parentPolicyId, policy.id);
      
      await onUpdateStatus(policy.id, 'published');
      toast({
        title: "Success",
        description: "Policy published successfully. Previous versions have been archived.",
      });
      onClose();
    } catch (error) {
      console.error('Error publishing policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish policy.",
      });
    }
  };

  const handleViewVersion = (versionId: string) => {
    setViewingVersionId(versionId);
  };

  if (isLoading) {
    return <PolicyViewLoading onClose={onClose} />;
  }

  if (!policy) {
    return <PolicyNotFound onClose={onClose} />;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden [&>button]:hidden">
        <div className="flex items-center justify-between mb-4">
          <PolicyViewHeader policy={policy} onClose={onClose} />
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintPolicy}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Policy
          </Button>
        </div>
        
        <Tabs defaultValue="content" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Policy Content</TabsTrigger>
            <TabsTrigger value="comments">Discussion</TabsTrigger>
            <TabsTrigger value="versions">Version History</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="overflow-y-auto max-h-[55vh]">
            <div className="space-y-4">
              <PolicyViewContent policy={policy} />
            </div>
          </TabsContent>

          <TabsContent value="comments" className="overflow-y-auto max-h-[55vh]">
            <PolicyCommentSection policyId={policy.id} />
          </TabsContent>
          
          <TabsContent value="versions" className="overflow-y-auto max-h-[55vh]">
            <PolicyVersionHistory 
              policyId={policyId} 
              onViewVersion={handleViewVersion}
            />
          </TabsContent>

          <TabsContent value="metadata" className="overflow-y-auto max-h-[55vh]">
            <PolicyViewMetadata policy={policy} />
          </TabsContent>
        </Tabs>

        <PolicyViewActions
          policy={policy}
          onClose={onClose}
          onEdit={onEdit}
          onUpdateStatus={onUpdateStatus}
          onReturnToDraft={handleReturnToDraft}
          onPublish={handlePublish}
          onRefresh={onRefresh}
        />
      </DialogContent>
    </Dialog>
  );
}
