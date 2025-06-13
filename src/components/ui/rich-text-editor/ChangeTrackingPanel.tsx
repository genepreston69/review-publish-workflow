
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChangeTrackingHeader } from './ChangeTrackingHeader';
import { ChangeListItem } from './ChangeListItem';

interface PolicyChange {
  id: string;
  user_name: string;
  user_initials: string;
  user_color: string;
  change_type: 'insert' | 'delete' | 'modify' | 'format';
  content_before: string | null;
  content_after: string | null;
  position_start: number;
  position_end: number;
  timestamp: string;
  is_accepted: boolean;
  accepted_by: string | null;
  accepted_at: string | null;
  metadata: Record<string, any>;
}

interface ChangeTrackingPanelProps {
  changes: PolicyChange[];
  isLoading: boolean;
  canReviewChanges: boolean;
  onAcceptChange: (changeId: string) => void;
  onRejectChange: (changeId: string) => void;
  onRefresh: () => void;
}

export function ChangeTrackingPanel({
  changes,
  isLoading,
  canReviewChanges,
  onAcceptChange,
  onRejectChange,
  onRefresh
}: ChangeTrackingPanelProps) {
  const [showAcceptedChanges, setShowAcceptedChanges] = useState(false);

  const filteredChanges = showAcceptedChanges 
    ? changes 
    : changes.filter(change => !change.is_accepted);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Loading changes...
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50">
      <ChangeTrackingHeader
        showAcceptedChanges={showAcceptedChanges}
        filteredChangesCount={filteredChanges.length}
        onToggleAcceptedChanges={() => setShowAcceptedChanges(!showAcceptedChanges)}
        onRefresh={onRefresh}
      />

      <ScrollArea className="h-96">
        <div className="p-4 space-y-3">
          {filteredChanges.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8">
              No changes found
            </div>
          ) : (
            filteredChanges.map((change) => (
              <ChangeListItem
                key={change.id}
                change={change}
                canReviewChanges={canReviewChanges}
                onAcceptChange={onAcceptChange}
                onRejectChange={onRejectChange}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
