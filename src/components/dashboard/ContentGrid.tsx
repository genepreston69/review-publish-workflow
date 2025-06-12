
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentCard } from '@/components/ContentCard';
import { Content } from '@/types/content';

interface ContentGridProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onView: (content: Content) => void;
  onPublish: (content: Content) => void;
  emptyMessage: string;
}

export const ContentGrid = ({ 
  contents, 
  onEdit, 
  onView, 
  onPublish, 
  emptyMessage 
}: ContentGridProps) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'compact'

  if (contents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with view controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-slate-500">{contents.length} {contents.length === 1 ? 'item' : 'items'}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="text-xs"
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="text-xs"
          >
            List
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="text-xs"
          >
            Compact
          </Button>
        </div>
      </div>

      {/* Responsive grid/list view */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              id={content.id}
              title={content.title}
              body={content.body}
              status={content.status}
              authorId={content.authorId}
              assignedPublisherId={content.assignedPublisherId}
              createdAt={content.createdAt.toISOString()}
              onEdit={(id) => onEdit(content)}
              onView={(id) => onView(content)}
              onPublish={(id) => onPublish(content)}
            />
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'compact' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        }`}>
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              id={content.id}
              title={content.title}
              body={content.body}
              status={content.status}
              authorId={content.authorId}
              assignedPublisherId={content.assignedPublisherId}
              createdAt={content.createdAt.toISOString()}
              onEdit={(id) => onEdit(content)}
              onView={(id) => onView(content)}
              onPublish={(id) => onPublish(content)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
