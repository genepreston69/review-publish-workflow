
import { Button } from '@/components/ui/button';
import { RotateCcw, Edit, CheckCircle, Printer } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePolicyDuplication } from '@/hooks/usePolicyDuplication';
import { generatePolicyPrintTemplate } from './policyPrintUtils';

interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  policy_type: string | null;
  purpose: string | null;
  policy_text: string | null;
  procedure: string | null;
  reviewer: string | null;
  created_at: string;
  status: string | null;
}

interface PolicyViewActionsProps {
  policy: Policy;
  onClose: () => void;
  onEdit?: (policyId: string) => void;
  onUpdateStatus?: (policyId: string, newStatus: string) => void;
  onReturnToDraft: () => void;
  onPublish?: () => void;
  onRefresh?: () => void;
}

export function PolicyViewActions({ 
  policy, 
  onClose, 
  onEdit, 
  onUpdateStatus, 
  onReturnToDraft,
  onPublish,
  onRefresh
}: PolicyViewActionsProps) {
  const { userRole } = useAuth();
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isEditor = userRole === 'edit';
  const { duplicatePolicyForUpdate, isLoading: isDuplicating } = usePolicyDuplication();

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

  return (
    <div className="flex justify-between mt-6 pt-4 border-t">
      <div className="flex gap-2">
        {/* Print Button - Always visible */}
        <Button 
          variant="outline" 
          onClick={handlePrint}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>

        {/* Return to Draft Button - Show prominently for publishers on under-review policies */}
        {canPublish && onUpdateStatus && (policy.status === 'under-review' || policy.status === 'under review') && (
          <Button 
            variant="outline" 
            onClick={onReturnToDraft}
            className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Return to Draft
          </Button>
        )}

        {/* Update Policy Button - Show for published policies for users with edit/publish permissions */}
        {policy.status === 'published' && (isEditor || canPublish) && (
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

        {/* Edit Button */}
        {onEdit && (
          (isEditor && policy.status === 'draft') ||
          (canPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review'))
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

        {/* Publish Button - Show for publishers/admins on draft or under-review policies */}
        {canPublish && onPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review') && (
          <Button 
            onClick={onPublish}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Publish Policy
          </Button>
        )}
      </div>

      <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
        Close
      </Button>
    </div>
  );
}
