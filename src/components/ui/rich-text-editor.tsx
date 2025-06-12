
import { EditorContent } from '@tiptap/react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EditorToolbar } from './rich-text-editor/EditorToolbar';
import { EditorStyles } from './rich-text-editor/EditorStyles';
import { EditorContainer } from './rich-text-editor/EditorContainer';
import { useEditorSetup } from './rich-text-editor/useEditorSetup';
import { useUserProfile } from './rich-text-editor/useUserProfile';
import { processContentForDisplay, determineJsonMode } from './rich-text-editor/contentUtils';
import { EnhancedChangeTrackingPanel } from './rich-text-editor/EnhancedChangeTrackingPanel';
import { AdminControls } from './rich-text-editor/AdminControls';
import { usePolicyChangeTracking } from '@/hooks/usePolicyChangeTrackingSimple';
import { useAuth } from '@/hooks/useAuth';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  context?: string;
  showBottomToolbar?: boolean;
  isEditMode?: boolean;
  policyId?: string;
  fieldName?: string;
  showChangeTracking?: boolean;
  isNewPolicy?: boolean;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder, 
  className, 
  context,
  showBottomToolbar = false,
  isEditMode = false,
  policyId,
  fieldName = 'content',
  showChangeTracking = false,
  isNewPolicy = false
}: RichTextEditorProps) {
  const { userRole } = useAuth();
  const userInitials = useUserProfile();
  const [isJsonMode, setIsJsonMode] = useState<boolean>(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  // Initialize change tracking if policy context is provided
  const changeTracking = usePolicyChangeTracking({
    policyId: policyId || '',
    fieldName
  });

  // Set JSON mode based on content type
  useEffect(() => {
    setIsJsonMode(determineJsonMode(content));
  }, [content]);

  // Load changes when component mounts
  useEffect(() => {
    if (showChangeTracking && policyId) {
      changeTracking.loadChanges();
    }
  }, [showChangeTracking, policyId]);

  // Always clean the content for display
  const displayContent = useMemo(() => {
    return processContentForDisplay(content);
  }, [content]);

  const editor = useEditorSetup({ 
    content: displayContent, 
    onChange: (newContent) => {
      onChange(newContent);
      
      // Record change if tracking is enabled and policy context exists
      if (trackingEnabled && policyId && changeTracking.recordChange) {
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
      }
    }, 
    isJsonMode 
  });

  if (!editor) {
    return null;
  }

  const editorContentClassName = cn(
    "min-h-[200px]",
    isEditMode && "edit-mode-text"
  );

  const handleToggleTracking = () => {
    setTrackingEnabled(!trackingEnabled);
  };

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
    <div className="flex">
      <EditorContainer isEditMode={isEditMode} className={className}>
        <EditorToolbar
          editor={editor}
          trackingEnabled={trackingEnabled}
          userInitials={userInitials}
          onToggleTracking={handleToggleTracking}
          position="top"
          content={displayContent}
          onContentChange={onChange}
          showTrackingToggle={!!policyId}
        />
        
        <EditorContent 
          editor={editor} 
          className={editorContentClassName}
          placeholder={placeholder}
        />
        
        {showBottomToolbar && (
          <EditorToolbar
            editor={editor}
            trackingEnabled={trackingEnabled}
            userInitials={userInitials}
            onToggleTracking={handleToggleTracking}
            position="bottom"
            content={displayContent}
            onContentChange={onChange}
            showTrackingToggle={!!policyId}
          />
        )}
        
        {/* Admin Controls - Show for publishers and super-admins */}
        <AdminControls
          editor={editor}
          userRole={userRole || 'read-only'}
          onContentChange={onChange}
          isNewPolicy={isNewPolicy}
        />
        
        <EditorStyles />
      </EditorContainer>

      {showChangeTracking && policyId && (
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
      )}
    </div>
  );
}
