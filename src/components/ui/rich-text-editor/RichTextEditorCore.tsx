
import { EditorContent } from '@tiptap/react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EditorToolbar } from './EditorToolbar';
import { EditorStyles } from './EditorStyles';
import { EditorContainer } from './EditorContainer';
import { useEditorSetup } from './useEditorSetup';
import { useUserProfile } from './useUserProfile';
import { processContentForDisplay, determineJsonMode } from './contentUtils';
import { AdminControls } from './AdminControls';

interface RichTextEditorCoreProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  context?: string;
  showBottomToolbar?: boolean;
  isEditMode?: boolean;
  isNewPolicy?: boolean;
  userRole?: string;
  trackingEnabled: boolean;
  onToggleTracking: () => void;
}

export function RichTextEditorCore({ 
  content, 
  onChange, 
  placeholder, 
  className, 
  context,
  showBottomToolbar = false,
  isEditMode = false,
  isNewPolicy = false,
  userRole = 'read-only',
  trackingEnabled,
  onToggleTracking
}: RichTextEditorCoreProps) {
  const userInitials = useUserProfile();

  // Set JSON mode based on content type
  const isJsonMode = useMemo(() => determineJsonMode(content), [content]);

  // Always clean the content for display
  const displayContent = useMemo(() => {
    return processContentForDisplay(content);
  }, [content]);

  const editor = useEditorSetup({ 
    content: displayContent, 
    onChange, 
    isJsonMode 
  });

  if (!editor) {
    return null;
  }

  const editorContentClassName = cn(
    "min-h-[200px]",
    isEditMode && "edit-mode-text"
  );

  return (
    <EditorContainer isEditMode={isEditMode} className={className}>
      <EditorToolbar
        editor={editor}
        trackingEnabled={trackingEnabled}
        userInitials={userInitials}
        onToggleTracking={onToggleTracking}
        position="top"
        content={displayContent}
        onContentChange={onChange}
        showTrackingToggle={true}
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
          onToggleTracking={onToggleTracking}
          position="bottom"
          content={displayContent}
          onContentChange={onChange}
          showTrackingToggle={true}
        />
      )}
      
      <AdminControls
        editor={editor}
        userRole={userRole}
        onContentChange={onChange}
        isNewPolicy={isNewPolicy}
      />
      
      <EditorStyles />
    </EditorContainer>
  );
}
