
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PolicyViewLoading } from './PolicyViewLoading';
import { PolicyViewNotFound } from './PolicyViewNotFound';
import { PolicyViewModalHeader } from './PolicyViewModalHeader';
import { PolicyViewModalTabs } from './PolicyViewModalTabs';
import { PolicyViewActions } from './PolicyViewActions';
import { usePolicyViewModalLogic } from './PolicyViewModalLogic';

interface PolicyViewModalProps {
  policyId: string;
  onClose: () => void;
  onEdit?: (policyId: string) => void;
  onUpdateStatus?: (policyId: string, newStatus: string, comment?: string) => void;
  onRefresh?: () => void;
}

export function PolicyViewModal({ policyId, onClose, onEdit, onUpdateStatus, onRefresh }: PolicyViewModalProps) {
  const {
    isLoading,
    policy,
    viewingVersionId,
    showTopPublishButton,
    handlePrintPolicy,
    handleTopPublish,
    handleReturnToDraft,
    handlePublish,
    handleUpdateStatusWithRefresh,
    handleViewVersion,
    handleViewReplacement,
    handleArchivePolicy,
    loadPolicy
  } = usePolicyViewModalLogic({
    policyId,
    onClose,
    onEdit,
    onUpdateStatus,
    onRefresh
  });

  if (isLoading) {
    return <PolicyViewLoading onClose={onClose} />;
  }

  if (!policy) {
    return <PolicyViewNotFound onClose={onClose} />;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden [&>button]:hidden">
        <PolicyViewModalHeader
          policy={policy}
          onClose={onClose}
          onPrint={handlePrintPolicy}
          onTopPublish={handleTopPublish}
          showTopPublishButton={showTopPublishButton}
        />
        
        <PolicyViewModalTabs
          policy={policy}
          policyId={policyId}
          onViewVersion={handleViewVersion}
          onViewReplacement={handleViewReplacement}
        />

        <PolicyViewActions
          policy={policy}
          onClose={onClose}
          onEdit={onEdit}
          onUpdateStatus={handleUpdateStatusWithRefresh}
          onReturnToDraft={handleReturnToDraft}
          onPublish={handlePublish}
          onRefresh={() => {
            loadPolicy();
            if (onRefresh) onRefresh();
          }}
          onArchive={handleArchivePolicy}
        />
      </DialogContent>
    </Dialog>
  );
}
