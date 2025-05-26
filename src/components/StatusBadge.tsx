
import { Badge } from '@/components/ui/badge';
import { ContentStatus } from '@/types/content';

interface StatusBadgeProps {
  status: ContentStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'under-review':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      case 'published':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'under-review':
        return 'Under Review';
      case 'published':
        return 'Published';
      default:
        return status;
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
};
