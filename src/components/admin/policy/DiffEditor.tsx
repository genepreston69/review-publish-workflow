
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { DiffViewer } from './diff/DiffViewer';
import { RevisionHistory } from './diff/RevisionHistory';
import { useRevisionManager } from './diff/useRevisionManager';

interface DiffEditorProps {
  policyId: string;
  fieldName: string;
  originalContent: string;
  currentContent: string;
  onRevisionsUpdated?: () => void;
}

export function DiffEditor({ 
  policyId, 
  fieldName, 
  originalContent, 
  currentContent,
  onRevisionsUpdated 
}: DiffEditorProps) {
  const [showSideBySide, setShowSideBySide] = useState(false);
  const { 
    revisions, 
    isLoading, 
    canReview,
    createRevision, 
    updateRevisionStatus 
  } = useRevisionManager(policyId, fieldName);

  const hasChanges = originalContent !== currentContent;
  const hasPendingRevisions = revisions.some(r => r.status === 'pending');

  const handleCreateRevision = async () => {
    await createRevision(originalContent, currentContent);
    if (onRevisionsUpdated) onRevisionsUpdated();
  };

  const handleAcceptRevision = async (revisionId: string) => {
    await updateRevisionStatus(revisionId, 'accepted');
    if (onRevisionsUpdated) onRevisionsUpdated();
  };

  const handleRejectRevision = async (revisionId: string) => {
    await updateRevisionStatus(revisionId, 'rejected', 'Changes not approved');
    if (onRevisionsUpdated) onRevisionsUpdated();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Changes for {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSideBySide(!showSideBySide)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showSideBySide ? 'Inline View' : 'Side-by-Side'}
            </Button>
            {hasChanges && (
              <Button onClick={handleCreateRevision} size="sm">
                Create Revision
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasChanges && (
          <div>
            <div className="mb-3">
              <Badge variant={hasPendingRevisions ? "destructive" : "secondary"}>
                {hasPendingRevisions ? 'Has Pending Changes' : 'No Pending Changes'}
              </Badge>
            </div>
            
            <DiffViewer
              originalContent={originalContent}
              modifiedContent={currentContent}
              showSideBySide={showSideBySide}
            />
          </div>
        )}

        <RevisionHistory
          revisions={revisions}
          showSideBySide={showSideBySide}
          canReview={canReview}
          onAcceptRevision={handleAcceptRevision}
          onRejectRevision={handleRejectRevision}
        />

        {!hasChanges && revisions.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No changes or revisions for this field.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
