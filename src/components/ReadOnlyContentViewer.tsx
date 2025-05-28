
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from './StatusBadge';
import { Content } from '@/types/content';
import { Calendar, User } from 'lucide-react';

interface ReadOnlyContentViewerProps {
  content: Content | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReadOnlyContentViewer = ({ content, isOpen, onClose }: ReadOnlyContentViewerProps) => {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start mb-4">
            <DialogTitle className="text-2xl font-bold leading-tight pr-4">
              {content.title}
            </DialogTitle>
            <StatusBadge status={content.status} />
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-500 border-b pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {content.publishedAt 
                  ? `Published: ${content.publishedAt.toLocaleDateString()}` 
                  : `Created: ${content.createdAt.toLocaleDateString()}`
                }
              </span>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {content.body}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
