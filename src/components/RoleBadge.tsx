
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/user';

interface RoleBadgeProps {
  role: UserRole;
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'read-only':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'edit':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'publish':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'read-only':
        return 'Read Only';
      case 'edit':
        return 'Editor';
      case 'publish':
        return 'Publisher';
      default:
        return role;
    }
  };

  return (
    <Badge className={getRoleColor(role)}>
      {getRoleLabel(role)}
    </Badge>
  );
};
