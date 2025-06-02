
import { EditorContent } from '@tiptap/react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EditorToolbar } from './rich-text-editor/EditorToolbar';
import { EditorStyles } from './rich-text-editor/EditorStyles';
import { EditorContainer } from './rich-text-editor/EditorContainer';
import { useEditorSetup } from './rich-text-editor/useEditorSetup';
import { useUserProfile } from './rich-text-editor/useUserProfile';
import { processContentForDisplay, determineJsonMode } from './rich-text-editor/contentUtils';
import { ChangeTrackingPanel } from './rich-text-editor/ChangeTrackingPanel';
import { usePolicyChangeTracking } from '@/hooks/usePolicyChangeTracking';

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
  showChangeTracking = false
}: RichTextEditorProps) {
  const userInitials = useUserProfile();
  const [isJsonMode, setIsJsonMode] = useState<boolean>(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  // Initialize change tracking if policy context is provided
  const changeTracking = usePolicyChangeTracking({
    policyId: policyId || '',
    fieldName
  });

  // Debug log to verify edit mode is being passed correctly
  console.log('RichTextEditor - isEditMode:', isEditMode);

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

  // Always clean the content for display - aggressively strip any HTML
  const displayContent = useMemo(() => {
    return processContentForDisplay(content);
  }, [content]);

  const editor = useEditorSetup({ 
    content: displayContent, 
    onChange: (newContent) => {
      onChange(newContent);
      
      // Record change if tracking is enabled and policy context exists
      if (trackingEnabled && policyId && changeTracking.recordChange) {
        // Simple change detection - in a real implementation you'd want more sophisticated diffing
        const oldLength = content.length;
        const newLength = newContent.length;
        
        if (newLength > oldLength) {
          // Content was added
          changeTracking.recordChange({
            changeType: 'insert',
            contentAfter: newContent.substring(oldLength),
            positionStart: oldLength,
            positionEnd: newLength,
            metadata: { oldLength, newLength }
          });
        } else if (newLength < oldLength) {
          // Content was removed
          changeTracking.recordChange({
            changeType: 'delete',
            contentBefore: content.substring(newLength),
            positionStart: newLength,
            positionEnd: oldLength,
            metadata: { oldLength, newLength }
          });
        } else if (newContent !== content) {
          // Content was modified
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

  console.log('Editor content className:', editorContentClassName);

  const handleToggleTracking = () => {
    setTrackingEnabled(!trackingEnabled);
  };

  const handleAcceptChange = (changeId: string) => {
    changeTracking.updateChangeStatus(changeId, true);
  };

  const handleRejectChange = (changeId: string) => {
    changeTracking.updateChangeStatus(changeId, false);
  };

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
        <EditorStyles />
      </EditorContainer>

      {showChangeTracking && policyId && (
        <ChangeTrackingPanel
          changes={changeTracking.changes}
          isLoading={changeTracking.isLoading}
          canReviewChanges={changeTracking.canReviewChanges}
          onAcceptChange={handleAcceptChange}
          onRejectChange={handleRejectChange}
          onRefresh={changeTracking.loadChanges}
        />
      )}
    </div>
  );
}
