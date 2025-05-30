
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PolicyViewLoading } from './PolicyViewLoading';
import { PolicyNotFound } from './PolicyNotFound';
import { PolicyViewHeader } from './PolicyViewHeader';
import { PolicyViewMetadata } from './PolicyViewMetadata';
import { PolicyViewContent } from './PolicyViewContent';
import { PolicyViewActions } from './PolicyViewActions';

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

export function PolicyViewModal({ policyId, onClose, onEdit, onUpdateStatus }: PolicyViewModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState<Policy | null>(null);

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

  if (isLoading) {
    return <PolicyViewLoading onClose={onClose} />;
  }

  if (!policy) {
    return <PolicyNotFound onClose={onClose} />;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto [&>button]:hidden">
        <PolicyViewHeader policy={policy} onClose={onClose} />
        <PolicyViewMetadata policy={policy} />
        <PolicyViewContent policy={policy} />
        <PolicyViewActions
          policy={policy}
          onClose={onClose}
          onEdit={onEdit}
          onUpdateStatus={onUpdateStatus}
          onReturnToDraft={handleReturnToDraft}
          onPublish={handlePublish}
        />
      </DialogContent>
    </Dialog>
  );
}
