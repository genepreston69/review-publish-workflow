import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RotateCcw, Edit, CheckCircle, Printer, MessageSquare, Archive } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePolicyDuplication } from '@/hooks/usePolicyDuplication';
import { generatePolicyPrintTemplate } from './policyPrintUtils';
import { Policy } from './types';

interface PolicyViewActionsProps {
  policy: Policy;
  onClose: () => void;
  onEdit?: (policyId: string) => void;
  onUpdateStatus?: (policyId: string, newStatus: string, comment?: string) => void;
  onReturnToDraft: () => void;
  onPublish?: () => void;
  onRefresh?: () => void;
  onArchive?: (policyId: string) => void;
}

export function PolicyViewActions({ 
  policy, 
  onClose, 
  onEdit, 
  onUpdateStatus, 
  onReturnToDraft,
  onPublish,
  onRefresh,
  onArchive
}: PolicyViewActionsProps) {
  const { userRole, currentUser } = useAuth();
  const [reviewerComment, setReviewerComment] = useState('');
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [actionType, setActionType] = useState<'request-changes' | 'publish' | null>(null);
  
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isEditor = userRole === 'edit';
  const isSuperAdmin = userRole === 'super-admin';
  const { duplicatePolicyForUpdate, archiveByPolicyNumber, isLoading: isDuplicating } = usePolicyDuplication();

  // Check if current user is the creator (maker/checker enforcement)
  const isCreator = currentUser?.id === policy.creator_id;
  // Super admins can approve/publish any policy, regular publishers can't approve their own
  const canApproveOrPublish = isSuperAdmin || (canPublish && !isCreator);

  const handleUpdatePolicy = async () => {
    const newPolicyId = await duplicatePolicyForUpdate(policy.id);
    if (newPolicyId && onRefresh) {
      onRefresh();
    }
  };

  const handlePrint = () => {
    // Combine all policy content sections
    let policyContent = '';
    
    if (policy.purpose) {
      policyContent += `<div class="policy-section">
        <h2>PURPOSE</h2>
        <div>${policy.purpose}</div>
      </div>`;
    }
    
    if (policy.policy_text) {
      policyContent += `<div class="policy-section">
        <h2>POLICY</h2>
        <div>${policy.policy_text}</div>
      </div>`;
    }
    
    if (policy.procedure) {
      policyContent += `<div class="policy-section">
        <h2>PROCEDURE</h2>
        <div>${policy.procedure}</div>
      </div>`;
    }

    const printHtml = generatePolicyPrintTemplate(
      policy.name || '',
      policy.policy_number || '',
      policy.policy_type || '',
      policyContent,
      policy.reviewer || '',
      policy.created_at,
      policy.status || ''
    );

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  };

  const handleCommentAction = async () => {
    if (!actionType || !onUpdateStatus) return;

    if (actionType === 'request-changes') {
      await onUpdateStatus(policy.id, 'awaiting-changes', reviewerComment);
    } else if (actionType === 'publish') {
      // When publishing, archive old versions first using policy number
      try {
        if (policy.policy_number) {
          await archiveByPolicyNumber(policy.policy_number, policy.id);
        }
        await onUpdateStatus(policy.id, 'published', reviewerComment);
      } catch (error) {
        console.error('Error during publish with versioning:', error);
        // Still try to publish even if archiving fails
        await onUpdateStatus(policy.id, 'published', reviewerComment);
      }
    }

    setReviewerComment('');
    setShowCommentSection(false);
    setActionType(null);
    onClose();
  };

  const handleRequestChanges = () => {
    setActionType('request-changes');
    setShowCommentSection(true);
  };

  const handlePublishWithComment = () => {
    setActionType('publish');
    setShowCommentSection(true);
  };

  const handleDirectPublish = async () => {
    if (onPublish) {
      // Archive old versions before publishing using policy number
      try {
        if (policy.policy_number) {
          await archiveByPolicyNumber(policy.policy_number, policy.id);
        }
        await onPublish();
      } catch (error) {
        console.error('Error during direct publish with versioning:', error);
        // Still try to publish even if archiving fails
        await onPublish();
      }
    }
  };

  if (showCommentSection) {
    return (
      <div className="space-y-4 mt-6 pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="reviewer-comment">
            {actionType === 'request-changes' ? 'Request Changes (Required)' : 'Review Comment (Optional)'}
          </Label>
          <Textarea
            id="reviewer-comment"
            value={reviewerComment}
            onChange={(e) => setReviewerComment(e.target.value)}
            placeholder={
              actionType === 'request-changes' 
                ? 'Explain what changes are needed...' 
                : 'Add any review notes...'
            }
            className="min-h-[100px]"
          />
        </div>
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowCommentSection(false);
              setActionType(null);
              setReviewerComment('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCommentAction}
            disabled={actionType === 'request-changes' && !reviewerComment.trim()}
            className={actionType === 'request-changes' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {actionType === 'request-changes' ? 'Request Changes' : 'Publish Policy'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between mt-6 pt-4 border-t">
      <div className="flex gap-2 flex-wrap">
        {/* Print Button - Always visible */}
        <Button 
          variant="outline" 
          onClick={handlePrint}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>

        {/* Archive Button - Super admins only */}
        {isSuperAdmin && onArchive && (
          <Button 
            variant="outline" 
            onClick={() => onArchive(policy.id)}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
        )}

        {/* Return to Draft Button - Show for reviewers on under-review policies */}
        {canApproveOrPublish && onUpdateStatus && (policy.status === 'under-review' || policy.status === 'under review') && (
          <Button 
            variant="outline" 
            onClick={onReturnToDraft}
            className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Return to Draft
          </Button>
        )}

        {/* Request Changes Button - Show for reviewers on under-review policies */}
        {canApproveOrPublish && (policy.status === 'under-review' || policy.status === 'under review') && (
          <Button 
            variant="outline" 
            onClick={handleRequestChanges}
            className="bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Request Changes
          </Button>
        )}

        {/* Update Policy Button - Show for published policies for users with edit/publish permissions or super admins */}
        {policy.status === 'published' && (isSuperAdmin || isEditor || canPublish) && (
          <Button 
            variant="outline" 
            onClick={handleUpdatePolicy}
            disabled={isDuplicating}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isDuplicating ? 'Creating Copy...' : 'Update Policy'}
          </Button>
        )}

        {/* Edit Button - Super admins can edit any policy, others follow existing rules */}
        {onEdit && (
          (isSuperAdmin ||
          (isCreator && (policy.status === 'draft' || policy.status === 'awaiting-changes')) ||
          (canPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review')))
        ) && (
          <Button 
            variant="outline" 
            onClick={() => onEdit(policy.id)}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Policy
          </Button>
        )}

        {/* Publish Button - Super admins can publish any policy, others follow maker/checker rules */}
        {canApproveOrPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review') && (
          <>
            <Button 
              onClick={handleDirectPublish}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Publish
            </Button>
            <Button 
              variant="outline"
              onClick={handlePublishWithComment}
              className="border-green-300 text-green-600 hover:bg-green-50"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Publish with Comment
            </Button>
          </>
        )}

        {/* Show reviewer comment if exists */}
        {policy.reviewer_comment && (
          <div className="w-full mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">Reviewer Comment:</h4>
            <p className="text-blue-800 text-sm">{policy.reviewer_comment}</p>
          </div>
        )}

        {/* Show maker/checker warning for creators (but not super admins) */}
        {isCreator && canPublish && !isSuperAdmin && (policy.status === 'under-review' || policy.status === 'under review') && (
          <div className="w-full mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> You cannot publish this policy since you created it. Another reviewer must approve it.
            </p>
          </div>
        )}
      </div>

      <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
        Close
      </Button>
    </div>
  );
}
