
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface PolicyNotFoundProps {
  onClose: () => void;
}

export function PolicyNotFound({ onClose }: PolicyNotFoundProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="w-8 h-8 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Policy Not Found</h3>
            <p className="text-gray-500">The requested policy could not be found.</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
