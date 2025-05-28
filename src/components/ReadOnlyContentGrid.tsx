
import { ReadOnlyContentCard } from './ReadOnlyContentCard';
import { Content } from '@/types/content';

interface ReadOnlyContentGridProps {
  items: Content[];
  onView: (content: Content) => void;
  emptyMessage?: string;
}

export const ReadOnlyContentGrid = ({ items, onView, emptyMessage = "No content available." }: ReadOnlyContentGridProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ReadOnlyContentCard
          key={item.id}
          content={item}
          onView={onView}
        />
      ))}
    </div>
  );
};
