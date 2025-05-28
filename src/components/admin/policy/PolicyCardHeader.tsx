
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from './policyUtils';

interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  status: string | null;
}

interface PolicyCardHeaderProps {
  policy: Policy;
}

export function PolicyCardHeader({ policy }: PolicyCardHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-base">
            {policy.name || 'Untitled Policy'}
          </CardTitle>
          {policy.policy_number && (
            <CardDescription className="font-mono text-xs">
              {policy.policy_number}
            </CardDescription>
          )}
        </div>
        {policy.status && (
          <Badge 
            variant="secondary" 
            className={getStatusColor(policy.status)}
          >
            {policy.status}
          </Badge>
        )}
      </div>
    </CardHeader>
  );
}
