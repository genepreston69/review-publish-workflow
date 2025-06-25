
import { Button } from '@/components/ui/button';
import { PolicyViewHeader } from './PolicyViewHeader';
import { CheckCircle, Printer } from 'lucide-react';
import { Policy } from './types';

interface PolicyViewModalHeaderProps {
  policy: Policy;
  onClose: () => void;
  onPrint: () => void;
  onTopPublish?: () => void;
  showTopPublishButton: boolean;
}

export function PolicyViewModalHeader({ 
  policy, 
  onClose, 
  onPrint, 
  onTopPublish, 
  showTopPublishButton 
}: PolicyViewModalHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <PolicyViewHeader policy={policy} onClose={onClose} />
      <div className="flex items-center gap-2">
        {showTopPublishButton && onTopPublish && (
          <Button
            onClick={onTopPublish}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Publish Policy
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Policy
        </Button>
      </div>
    </div>
  );
}
