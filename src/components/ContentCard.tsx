
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Content } from '@/types/content';
import { useAuth } from '@/hooks/useAuth';
import { Edit, Eye, CheckCircle } from 'lucide-react';

interface ContentCardProps {
  content: Content;
  onEdit?: (content: Content) => void;
  onView?: (content: Content) => void;
  onPublish?: (content: Content) => void;
}

export const ContentCard = ({ content, onEdit, onView, onPublish }: ContentCardProps) => {
  const { currentUser, userRole } = useAuth();

  const canEdit = userRole === 'edit' || userRole === 'publish';
  const canPublish = userRole === 'publish' && content.status === 'under-review';
  const isAuthor = currentUser?.id === content.authorId;
  const isAssignedPublisher = currentUser?.id === content.assignedPublisherId;

  // Only show edit button if user can edit and is either the author or a publisher
  const showEdit = canEdit && (isAuthor || userRole === 'publish');

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">{content.title}</CardTitle>
          <StatusBadge status={content.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {content.body.substring(0, 100)}...
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {content.createdAt.toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(content)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            {showEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(content)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {canPublish && (
              <Button
                size="sm"
                onClick={() => onPublish?.(content)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
