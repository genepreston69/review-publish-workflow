
import { Badge } from '@/components/ui/badge';
import { ContentStatus } from '@/types/content';

interface StatusBadgeProps {
  status: ContentStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300';
      case 'under-review':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300';
      case 'published':
        return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
    <Badge className={`${getStatusColor(status)} border`}>
      {getStatusLabel(status)}
    </Badge>
  );
};
