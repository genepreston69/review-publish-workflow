
import React from 'react';
import { RevisionDisplay } from './RevisionDisplay';
import { PolicyRevision } from '../types';

interface RevisionHistoryProps {
  revisions: PolicyRevision[];
  showSideBySide: boolean;
  canReview: boolean;
  onAcceptRevision: (revisionId: string) => void;
  onRejectRevision: (revisionId: string) => void;
}

export function RevisionHistory({ 
  revisions, 
  showSideBySide, 
  canReview,
  onAcceptRevision,
  onRejectRevision 
}: RevisionHistoryProps) {
  if (revisions.length === 0) return null;

  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-3">
        Revision History ({revisions.length} revisions)
      </div>
      <div className="space-y-3">
        {revisions.map((revision) => (
          <RevisionDisplay
            key={revision.id}
            revision={revision}
            showSideBySide={showSideBySide}
            canReview={canReview}
            onAccept={onAcceptRevision}
            onReject={onRejectRevision}
          />
        ))}
      </div>
    </div>
  );
}
