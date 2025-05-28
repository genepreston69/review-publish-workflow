
import { CardContent } from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { stripHtml } from './policyUtils';

interface Policy {
  id: string;
  purpose: string | null;
  reviewer: string | null;
  created_at: string;
}

interface PolicyCardContentProps {
  policy: Policy;
}

export function PolicyCardContent({ policy }: PolicyCardContentProps) {
  return (
    <CardContent className="flex-1">
      <div className="space-y-3">
        {policy.purpose && (
          <div>
            <h4 className="font-medium text-xs text-gray-700">Purpose</h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {stripHtml(policy.purpose)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          {policy.reviewer && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-20">{stripHtml(policy.reviewer)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(policy.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </CardContent>
  );
}
