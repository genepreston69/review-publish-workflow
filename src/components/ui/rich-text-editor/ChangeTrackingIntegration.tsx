
import { useState, useEffect } from 'react';
import { usePolicyChangeTracking } from '@/hooks/usePolicyChangeTrackingSimple';
import { EnhancedChangeTrackingPanel } from './EnhancedChangeTrackingPanel';

interface ChangeTrackingIntegrationProps {
  policyId: string;
  fieldName: string;
  content: string;
  trackingEnabled: boolean;
  onChange: (content: string) => void;
}

export function ChangeTrackingIntegration({
  policyId,
  fieldName,
  content,
  trackingEnabled,
  onChange
}: ChangeTrackingIntegrationProps) {
  const changeTracking = usePolicyChangeTracking({
    policyId,
    fieldName
  });

  // Load changes when component mounts
  useEffect(() => {
    if (policyId) {
      changeTracking.loadChanges();
    }
  }, [policyId]);

  // Record changes when tracking is enabled
  useEffect(() => {
    if (!trackingEnabled || !policyId || !changeTracking.recordChange) return;

    // This is a simplified change recording - in a real implementation,
    // you'd want more sophisticated change detection
    const handleContentChange = (newContent: string) => {
      const oldLength = content.length;
      const newLength = newContent.length;
      
      if (newLength > oldLength) {
        changeTracking.recordChange({
          changeType: 'insert',
          contentAfter: newContent.substring(oldLength),
          positionStart: oldLength,
          positionEnd: newLength,
          metadata: { oldLength, newLength }
        });
      } else if (newLength < oldLength) {
        changeTracking.recordChange({
          changeType: 'delete',
          contentBefore: content.substring(newLength),
          positionStart: newLength,
          positionEnd: oldLength,
          metadata: { oldLength, newLength }
        });
      } else if (newContent !== content) {
        changeTracking.recordChange({
          changeType: 'modify',
          contentBefore: content,
          contentAfter: newContent,
          positionStart: 0,
          positionEnd: newLength,
          metadata: { oldLength, newLength }
        });
      }
    };

    // Note: This is where you'd integrate with the editor's change events
    // For now, this is a placeholder for the change tracking logic
  }, [trackingEnabled, policyId, content, changeTracking.recordChange]);

  const handleAcceptChange = (changeId: string) => {
    changeTracking.updateChangeStatus(changeId, true);
  };

  const handleRejectChange = (changeId: string) => {
    changeTracking.updateChangeStatus(changeId, false);
  };

  const handleBulkAcceptAI = () => {
    const aiSuggestions = changeTracking.changes.filter(
      change => change.metadata?.isAISuggestion && !change.is_accepted
    );
    aiSuggestions.forEach(change => {
      changeTracking.updateChangeStatus(change.id, true);
    });
  };

  const handleBulkRejectAI = () => {
    const aiSuggestions = changeTracking.changes.filter(
      change => change.metadata?.isAISuggestion && !change.is_accepted
    );
    aiSuggestions.forEach(change => {
      changeTracking.updateChangeStatus(change.id, false);
    });
  };

  // Enhance changes with AI metadata
  const enhancedChanges = changeTracking.changes.map(change => ({
    ...change,
    is_ai_suggestion: change.metadata?.isAISuggestion || false,
    ai_operation: change.metadata?.aiOperation
  }));

  return (
    <EnhancedChangeTrackingPanel
      changes={enhancedChanges}
      isLoading={changeTracking.isLoading}
      canReviewChanges={changeTracking.canReviewChanges}
      onAcceptChange={handleAcceptChange}
      onRejectChange={handleRejectChange}
      onRefresh={changeTracking.loadChanges}
      onBulkAcceptAI={handleBulkAcceptAI}
      onBulkRejectAI={handleBulkRejectAI}
    />
  );
}
