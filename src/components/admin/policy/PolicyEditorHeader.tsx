
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface PolicyEditorHeaderProps {
  editorPoliciesCount: number;
  draftCount: number;
  rejectedCount: number;
  awaitingChangesCount: number;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export function PolicyEditorHeader({
  editorPoliciesCount,
  draftCount,
  rejectedCount,
  awaitingChangesCount,
  onCreateNew,
  onRefresh
}: PolicyEditorHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Policy Editor</h2>
        <p className="text-muted-foreground">
          Create and edit your policy drafts. You can only edit policies you've created that are in draft, rejected, or awaiting-changes status.
        </p>
        {editorPoliciesCount > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            <p>You have {editorPoliciesCount} {editorPoliciesCount === 1 ? 'policy' : 'policies'} to work on</p>
            <div className="flex gap-4 mt-1">
              <span>Drafts: {draftCount}</span>
              <span>Rejected: {rejectedCount}</span>
              <span>Awaiting Changes: {awaitingChangesCount}</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Policy
        </Button>
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
