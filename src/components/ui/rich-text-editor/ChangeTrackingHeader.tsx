
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface ChangeTrackingHeaderProps {
  showAcceptedChanges: boolean;
  filteredChangesCount: number;
  onToggleAcceptedChanges: () => void;
  onRefresh: () => void;
}

export function ChangeTrackingHeader({
  showAcceptedChanges,
  filteredChangesCount,
  onToggleAcceptedChanges,
  onRefresh
}: ChangeTrackingHeaderProps) {
  return (
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
          onClick={onToggleAcceptedChanges}
          className="text-xs h-7"
        >
          {showAcceptedChanges ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {showAcceptedChanges ? 'Hide Accepted' : 'Show All'}
        </Button>
        <span className="text-gray-500">
          {filteredChangesCount} {filteredChangesCount === 1 ? 'change' : 'changes'}
        </span>
      </div>
    </div>
  );
}
