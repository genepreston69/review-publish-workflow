
import { ContentCard } from '@/components/ContentCard';
import { Content } from '@/types/content';

interface ContentGridProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onView: (content: Content) => void;
  onPublish: (content: Content) => void;
  emptyMessage?: string;
}

export const ContentGrid = ({ 
  contents, 
  onEdit, 
  onView, 
  onPublish, 
  emptyMessage = "No content found." 
}: ContentGridProps) => {
  if (contents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((content) => (
        <ContentCard
          key={content.id}
          content={content}
          onEdit={onEdit}
          onView={onView}
          onPublish={onPublish}
        />
      ))}
    </div>
  );
};
