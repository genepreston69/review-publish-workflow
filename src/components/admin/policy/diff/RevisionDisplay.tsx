
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DiffViewer } from './DiffViewer';
import { RevisionControls } from './RevisionControls';
import { PolicyRevision } from '../types';

interface RevisionDisplayProps {
  revision: PolicyRevision;
  showSideBySide: boolean;
  canReview: boolean;
  onAccept: (revisionId: string) => void;
  onReject: (revisionId: string) => void;
}

export function RevisionDisplay({ 
  revision, 
  showSideBySide, 
  canReview,
  onAccept,
  onReject 
}: RevisionDisplayProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              Revision #{revision.revision_number}
            </span>
            <Badge 
              variant={
                revision.status === 'accepted' ? 'default' :
                revision.status === 'rejected' ? 'destructive' : 'secondary'
              }
            >
              {revision.status}
            </Badge>
            <Badge variant="outline">{revision.change_type}</Badge>
          </div>
          <div className="text-xs text-gray-500">
            Created: {new Date(revision.created_at).toLocaleDateString()}
          </div>
        </div>
        
        {revision.status === 'pending' && (
          <RevisionControls
            canReview={canReview}
            onAccept={() => onAccept(revision.id)}
            onReject={() => onReject(revision.id)}
          />
        )}
      </div>

      <DiffViewer
        originalContent={revision.original_content || ''}
        modifiedContent={revision.modified_content}
        showSideBySide={showSideBySide}
      />

      {revision.review_comment && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-md">
          <div className="text-sm font-medium text-yellow-800">Review Comment:</div>
          <div className="text-sm text-yellow-700">{revision.review_comment}</div>
        </div>
      )}
    </div>
  );
}
