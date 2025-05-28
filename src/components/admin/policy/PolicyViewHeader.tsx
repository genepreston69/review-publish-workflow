
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Policy {
  name: string | null;
  policy_number: string | null;
  policy_type: string | null;
}

interface PolicyViewHeaderProps {
  policy: Policy;
  onClose: () => void;
}

export function PolicyViewHeader({ policy, onClose }: PolicyViewHeaderProps) {
  return (
    <DialogHeader>
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-xl font-bold">
            {policy.name || 'Untitled Policy'}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 mt-2">
            {policy.policy_number && (
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {policy.policy_number}
              </span>
            )}
            {policy.policy_type && (
              <span className="text-sm text-gray-600">
                Type: {policy.policy_type}
              </span>
            )}
          </DialogDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </DialogHeader>
  );
}
