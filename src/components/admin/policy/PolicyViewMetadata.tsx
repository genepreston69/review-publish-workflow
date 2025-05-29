
import { User, Calendar } from 'lucide-react';
import { stripHtml } from './policyUtils';

interface Policy {
  reviewer: string | null;
  created_at: string;
  status: string | null;
}

interface PolicyViewMetadataProps {
  policy: Policy;
}

export function PolicyViewMetadata({ policy }: PolicyViewMetadataProps) {
  return (
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
          {stripHtml(policy.status)}
        </span>
      )}
    </div>
  );
}
