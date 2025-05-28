
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Content } from '@/types/content';
import { Eye, Calendar } from 'lucide-react';

interface ReadOnlyContentCardProps {
  content: Content;
  onView?: (content: Content) => void;
}

export const ReadOnlyContentCard = ({ content, onView }: ReadOnlyContentCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-semibold leading-tight">{content.title}</CardTitle>
          <StatusBadge status={content.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {content.body.substring(0, 150)}...
        </p>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              {content.publishedAt ? content.publishedAt.toLocaleDateString() : content.createdAt.toLocaleDateString()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(content)}
            className="flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Read More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
