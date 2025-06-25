
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface PolicyEditorEmptyStateProps {
  onCreateNew: () => void;
}

export function PolicyEditorEmptyState({ onCreateNew }: PolicyEditorEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No policies to edit</h3>
        <p className="text-gray-600 text-center mb-4">
          You don't have any policies in draft, rejected, or awaiting-changes status.
        </p>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Your First Policy
        </Button>
      </CardContent>
    </Card>
  );
}
