
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, UserCheck } from 'lucide-react';

interface UserStatusBadgeProps {
  status: 'active' | 'pending' | 'inactive' | 'invited';
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  const statusConfig = {
    active: {
      label: 'Active',
      variant: 'default' as const,
      icon: CheckCircle,
      className: 'bg-green-500 text-white hover:bg-green-600'
    },
    pending: {
      label: 'Pending',
      variant: 'secondary' as const,
      icon: Clock,
      className: 'bg-yellow-500 text-white hover:bg-yellow-600'
    },
    inactive: {
      label: 'Inactive',
      variant: 'destructive' as const,
      icon: XCircle,
      className: 'bg-red-500 text-white hover:bg-red-600'
    },
    invited: {
      label: 'Invited',
      variant: 'outline' as const,
      icon: UserCheck,
      className: 'bg-blue-500 text-white hover:bg-blue-600'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};
