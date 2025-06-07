
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import { Content } from '@/types/content';
import { useAuth } from '@/hooks/useAuth';
import { Edit, Eye, CheckCircle, MoreHorizontal, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentCardProps {
  content: Content;
  onEdit?: (content: Content) => void;
  onView?: (content: Content) => void;
  onPublish?: (content: Content) => void;
  compact?: boolean;
  listView?: boolean;
}

export const ContentCard = ({ 
  content, 
  onEdit, 
  onView, 
  onPublish, 
  compact = false, 
  listView = false 
}: ContentCardProps) => {
  const { currentUser, userRole } = useAuth();

  const canEdit = userRole === 'edit' || userRole === 'publish';
  const canPublish = userRole === 'publish' && content.status === 'under-review';
  const isAuthor = currentUser?.id === content.authorId;
  const isAssignedPublisher = currentUser?.id === content.assignedPublisherId;

  const showEdit = canEdit && (isAuthor || userRole === 'publish');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under-review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (listView) {
    return (
      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-slate-800 truncate">{content.title}</h3>
            </div>
            <p className="text-sm text-slate-600 line-clamp-1">{content.body.substring(0, 100)}...</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              <span>{content.createdAt.toLocaleDateString()}</span>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(content.status)} text-xs px-2 py-0.5 capitalize`}
              >
                {content.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4">
          {onView && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onView(content)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {showEdit && onEdit && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(content)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canPublish && onPublish && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onPublish(content)}>
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-md border-slate-200 ${compact ? 'p-2' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-slate-800 leading-tight`}>
              {content.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(content.status)} text-xs px-2 py-0.5 capitalize`}
              >
                {content.status}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(content)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              )}
              {showEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(content)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canPublish && onPublish && (
                <DropdownMenuItem onClick={() => onPublish(content)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'pt-0 px-3 pb-3' : 'pt-0'}>
        <div className="space-y-3">
          <div>
            <p className={`text-slate-700 ${compact ? 'text-xs' : 'text-sm'} line-clamp-2`}>
              {content.body.substring(0, 100)}...
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Created:</span>
              <span className="text-slate-700 font-medium">{content.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
