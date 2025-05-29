
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, stripHtml } from './policyUtils';

interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  status: string | null;
}

interface PolicyCardHeaderProps {
  policy: Policy;
  children?: React.ReactNode;
}

export function PolicyCardHeader({ policy, children }: PolicyCardHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-base">
            {stripHtml(policy.name) || 'Untitled Policy'}
          </CardTitle>
          {policy.policy_number && (
            <CardDescription className="font-mono text-xs">
              {stripHtml(policy.policy_number)}
            </CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          {policy.status && (
            <Badge 
              variant="secondary" 
              className={getStatusColor(policy.status)}
            >
              {stripHtml(policy.status)}
            </Badge>
          )}
          {children}
        </div>
      </div>
    </CardHeader>
  );
}
