
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/SafeAuthProvider';
import { Eye, Edit, CheckCircle, Clock, FileText } from 'lucide-react';

interface ContentCardProps {
  id: string;
  title: string;
  body: string;
  status: string;
  authorId: string;
  assignedPublisherId?: string;
  createdAt: string;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onPublish?: (id: string) => void;
}

export const ContentCard = ({ 
  id, 
  title, 
  body, 
  status, 
  authorId, 
  assignedPublisherId, 
  createdAt, 
  onEdit, 
  onView, 
  onPublish 
}: ContentCardProps) => {
  const { user, userRole } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'under-review':
        return <Clock className="w-4 h-4" />;
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = user?.id === authorId || userRole === 'super-admin';
  const canPublish = (userRole === 'publish' || userRole === 'super-admin') && 
                     status === 'under-review' && 
                     user?.id !== authorId; // Can't publish your own content

  const handlePublish = async () => {
    if (!onPublish) return;
    
    setIsPublishing(true);
    try {
      await onPublish(id);
    } finally {
      setIsPublishing(false);
    }
  };

  // Truncate body for preview
  const truncatedBody = body.length > 150 ? body.substring(0, 150) + '...' : body;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
          <Badge className={`ml-2 flex items-center gap-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            {status.replace('-', ' ')}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-500">
          Created {new Date(createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-4">{truncatedBody}</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(id)}
            className="flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
          
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(id)}
              className="flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          )}
          
          {canPublish && onPublish && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
