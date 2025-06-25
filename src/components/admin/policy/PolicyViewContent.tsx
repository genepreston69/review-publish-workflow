
import { Badge } from '@/components/ui/badge';
import { PolicyReplacementBanner } from './PolicyReplacementBanner';
import { stripHtml } from './policyUtils';
import { Policy } from './types';

interface PolicyViewContentProps {
  policy: Policy;
  onViewReplacement?: (policyId: string) => void;
}

export function PolicyViewContent({ policy, onViewReplacement }: PolicyViewContentProps) {
  const getStatusColor = (status: string | null) => {
    const cleanStatus = stripHtml(status);
    switch (cleanStatus?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under-review':
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'awaiting-changes':
      case 'awaiting changes':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Show replacement banner for archived policies */}
      {policy.status === 'archived' && (
        <PolicyReplacementBanner 
          policyId={policy.id} 
          onViewReplacement={onViewReplacement}
        />
      )}

      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
        <div>
          <h3 className="font-semibold text-slate-900">{stripHtml(policy.name) || 'Untitled Policy'}</h3>
          <p className="text-sm text-slate-600">Policy Number: {policy.policy_number}</p>
        </div>
        <Badge 
          variant="outline" 
          className={`${getStatusColor(policy.status)} capitalize`}
        >
          {stripHtml(policy.status) || 'Unknown'}
        </Badge>
      </div>

      {policy.purpose && (
        <div>
          <h4 className="font-medium text-slate-800 mb-2">Purpose</h4>
          <div 
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: policy.purpose }}
          />
        </div>
      )}

      {policy.policy_text && (
        <div>
          <h4 className="font-medium text-slate-800 mb-2">Policy</h4>
          <div 
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: policy.policy_text }}
          />
        </div>
      )}

      {policy.procedure && (
        <div>
          <h4 className="font-medium text-slate-800 mb-2">Procedure</h4>
          <div 
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: policy.procedure }}
          />
        </div>
      )}
    </div>
  );
}
