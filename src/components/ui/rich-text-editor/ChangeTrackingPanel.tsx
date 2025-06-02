
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X, Eye, EyeOff, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'insert': return 'bg-green-100 text-green-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'modify': return 'bg-blue-100 text-blue-800';
      case 'format': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'insert': return 'Added';
      case 'delete': return 'Deleted';
      case 'modify': return 'Modified';
      case 'format': return 'Formatted';
      default: return changeType;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Loading changes...
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">Change History</h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onRefresh}
            className="text-xs h-7"
          >
            Refresh
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <Button
            size="sm"
            variant={showAcceptedChanges ? "outline" : "default"}
            onClick={() => setShowAcceptedChanges(!showAcceptedChanges)}
            className="text-xs h-7"
          >
            {showAcceptedChanges ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showAcceptedChanges ? 'Hide Accepted' : 'Show All'}
          </Button>
          <span className="text-gray-500">
            {filteredChanges.length} {filteredChanges.length === 1 ? 'change' : 'changes'}
          </span>
        </div>
      </div>

      <ScrollArea className="h-96">
        <div className="p-4 space-y-3">
          {filteredChanges.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8">
              No changes found
            </div>
          ) : (
            filteredChanges.map((change) => (
              <div key={change.id} className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                      style={{ backgroundColor: change.user_color }}
                    >
                      {change.user_initials}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{change.user_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getChangeTypeColor(change.change_type)}`}>
                    {getChangeTypeLabel(change.change_type)}
                  </Badge>
                </div>

                {change.content_before && (
                  <div className="text-xs">
                    <div className="text-gray-600 mb-1">Before:</div>
                    <div className="bg-red-50 border border-red-200 rounded p-2 text-red-800">
                      {change.content_before.substring(0, 100)}
                      {change.content_before.length > 100 && '...'}
                    </div>
                  </div>
                )}

                {change.content_after && (
                  <div className="text-xs">
                    <div className="text-gray-600 mb-1">After:</div>
                    <div className="bg-green-50 border border-green-200 rounded p-2 text-green-800">
                      {change.content_after.substring(0, 100)}
                      {change.content_after.length > 100 && '...'}
                    </div>
                  </div>
                )}

                {change.is_accepted ? (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="w-3 h-3" />
                    Accepted
                    {change.accepted_at && (
                      <span className="text-gray-500">
                        {formatDistanceToNow(new Date(change.accepted_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                ) : canReviewChanges ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAcceptChange(change.id)}
                      className="text-xs h-6 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRejectChange(change.id)}
                      className="text-xs h-6 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                    Pending review
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
