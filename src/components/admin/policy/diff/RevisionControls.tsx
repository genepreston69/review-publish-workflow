
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface RevisionControlsProps {
  canReview: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export function RevisionControls({ canReview, onAccept, onReject }: RevisionControlsProps) {
  if (!canReview) return null;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="default"
        onClick={onAccept}
      >
        <Check className="h-3 w-3 mr-1" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={onReject}
      >
        <X className="h-3 w-3 mr-1" />
        Reject
      </Button>
    </div>
  );
}
