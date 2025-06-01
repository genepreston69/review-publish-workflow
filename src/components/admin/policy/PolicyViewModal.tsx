
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PolicyViewLoading } from './PolicyViewLoading';
import { PolicyNotFound } from './PolicyNotFound';
import { PolicyViewHeader } from './PolicyViewHeader';
import { PolicyViewMetadata } from './PolicyViewMetadata';
import { PolicyViewContent } from './PolicyViewContent';
import { PolicyViewActions } from './PolicyViewActions';
import { PolicyVersionHistory } from './PolicyVersionHistory';
import { Policy } from './types';

interface PolicyViewModalProps {
  policyId: string;
  onClose: () => void;
  onEdit?: (policyId: string) => void;
  onUpdateStatus?: (policyId: string, newStatus: string) => void;
  onRefresh?: () => void;
}

export function PolicyViewModal({ policyId, onClose, onEdit, onUpdateStatus, onRefresh }: PolicyViewModalProps) {
  const { toast } = useToast();
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

    console.log('=== PUBLISHING POLICY ===', policy.id);
    try {
      await onUpdateStatus(policy.id, 'published');
      toast({
        title: "Success",
        description: "Policy published successfully.",
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
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden [&>button]:hidden">
        <PolicyViewHeader policy={policy} onClose={onClose} />
        
        <Tabs defaultValue="content" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Policy Content</TabsTrigger>
            <TabsTrigger value="versions">Version History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              <PolicyViewMetadata policy={policy} />
              <PolicyViewContent policy={policy} />
            </div>
          </TabsContent>
          
          <TabsContent value="versions" className="overflow-y-auto max-h-[60vh]">
            <PolicyVersionHistory 
              policyId={policyId} 
              onViewVersion={handleViewVersion}
            />
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
