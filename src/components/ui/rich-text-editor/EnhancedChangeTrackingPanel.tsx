
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, EyeOff, Clock, User, Wand2, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  is_ai_suggestion?: boolean;
  ai_operation?: string;
}

interface EnhancedChangeTrackingPanelProps {
  changes: PolicyChange[];
  isLoading: boolean;
  canReviewChanges: boolean;
  onAcceptChange: (changeId: string) => void;
  onRejectChange: (changeId: string) => void;
  onRefresh: () => void;
  onBulkAcceptAI?: () => void;
  onBulkRejectAI?: () => void;
}

type FilterType = 'all' | 'manual' | 'ai' | 'pending' | 'accepted';

export function EnhancedChangeTrackingPanel({
  changes,
  isLoading,
  canReviewChanges,
  onAcceptChange,
  onRejectChange,
  onRefresh,
  onBulkAcceptAI,
  onBulkRejectAI
}: EnhancedChangeTrackingPanelProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAcceptedChanges, setShowAcceptedChanges] = useState(false);

  const filteredChanges = changes.filter(change => {
    // Apply accepted/pending filter
    if (!showAcceptedChanges && change.is_accepted) return false;
    
    // Apply type filter
    switch (filter) {
      case 'manual':
        return !change.is_ai_suggestion;
      case 'ai':
        return change.is_ai_suggestion;
      case 'pending':
        return !change.is_accepted;
      case 'accepted':
        return change.is_accepted;
      default:
        return true;
    }
  });

  const aiSuggestions = changes.filter(change => change.is_ai_suggestion && !change.is_accepted);
  const manualChanges = changes.filter(change => !change.is_ai_suggestion);

  const getChangeTypeColor = (changeType: string, isAI?: boolean) => {
    const baseColor = (() => {
      switch (changeType) {
        case 'insert': return isAI ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800';
        case 'delete': return 'bg-red-100 text-red-800';
        case 'modify': return isAI ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800';
        case 'format': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    })();
    return baseColor;
  };

  const getChangeTypeLabel = (changeType: string, aiOperation?: string) => {
    if (aiOperation) {
      return `AI: ${aiOperation}`;
    }
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
        
        <div className="flex items-center gap-2 text-xs mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="text-xs h-7">
                <Filter className="w-3 h-3 mr-1" />
                {filter === 'all' ? 'All' : filter === 'ai' ? 'AI' : filter === 'manual' ? 'Manual' : filter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter('all')}>All Changes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('manual')}>Manual Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('ai')}>AI Suggestions</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('pending')}>Pending Review</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('accepted')}>Accepted</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant={showAcceptedChanges ? "outline" : "default"}
            onClick={() => setShowAcceptedChanges(!showAcceptedChanges)}
            className="text-xs h-7"
          >
            {showAcceptedChanges ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showAcceptedChanges ? 'Hide' : 'Show'} Accepted
          </Button>
        </div>

        {/* Bulk AI operations */}
        {canReviewChanges && aiSuggestions.length > 0 && (
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              onClick={onBulkAcceptAI}
              className="text-xs h-7 bg-purple-600 hover:bg-purple-700"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              Accept All AI
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onBulkRejectAI}
              className="text-xs h-7 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              Reject All AI
            </Button>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          {filteredChanges.length} changes • {aiSuggestions.length} AI • {manualChanges.length} manual
        </div>
      </div>

      <ScrollArea className="h-96">
        <div className="p-4 space-y-3">
          {filteredChanges.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8">
              No changes found for current filter
            </div>
          ) : (
            filteredChanges.map((change) => (
              <div key={change.id} className={`bg-white rounded-lg p-3 border space-y-2 ${
                change.is_ai_suggestion ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white relative"
                      style={{ backgroundColor: change.user_color }}
                    >
                      {change.user_initials}
                      {change.is_ai_suggestion && (
                        <Wand2 className="w-3 h-3 absolute -top-1 -right-1 bg-purple-600 text-white rounded-full p-0.5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{change.user_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getChangeTypeColor(change.change_type, change.is_ai_suggestion)}`}>
                    {getChangeTypeLabel(change.change_type, change.ai_operation)}
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
                    <div className={`border rounded p-2 ${
                      change.is_ai_suggestion 
                        ? 'bg-purple-50 border-purple-200 text-purple-800'
                        : 'bg-green-50 border-green-200 text-green-800'
                    }`}>
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
                      className={`text-xs h-6 ${
                        change.is_ai_suggestion 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
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
                  <div className={`text-xs border rounded p-2 ${
                    change.is_ai_suggestion
                      ? 'text-purple-600 bg-purple-50 border-purple-200'
                      : 'text-amber-600 bg-amber-50 border-amber-200'
                  }`}>
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
