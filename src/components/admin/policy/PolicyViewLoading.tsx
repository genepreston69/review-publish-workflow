
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface PolicyViewLoadingProps {
  onClose: () => void;
}

export function PolicyViewLoading({ onClose }: PolicyViewLoadingProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Loading policy...</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
