
import { EditorContent } from '@tiptap/react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EditorToolbar } from './rich-text-editor/EditorToolbar';
import { EditorStyles } from './rich-text-editor/EditorStyles';
import { EditorContainer } from './rich-text-editor/EditorContainer';
import { useEditorSetup } from './rich-text-editor/useEditorSetup';
import { useUserProfile } from './rich-text-editor/useUserProfile';
import { processContentForDisplay, determineJsonMode } from './rich-text-editor/contentUtils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  context?: string;
  showBottomToolbar?: boolean;
  isEditMode?: boolean;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder, 
  className, 
  context,
  showBottomToolbar = false,
  isEditMode = false
}: RichTextEditorProps) {
  const userInitials = useUserProfile();
  const [isJsonMode, setIsJsonMode] = useState<boolean>(false);

  // Debug log to verify edit mode is being passed correctly
  console.log('RichTextEditor - isEditMode:', isEditMode);

  // Set JSON mode based on content type
  useEffect(() => {
    setIsJsonMode(determineJsonMode(content));
  }, [content]);

  // Always clean the content for display - aggressively strip any HTML
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

  console.log('Editor content className:', editorContentClassName);

  return (
    <EditorContainer isEditMode={isEditMode} className={className}>
      <EditorToolbar
        editor={editor}
        trackingEnabled={false}
        userInitials={userInitials}
        onToggleTracking={() => {}}
        position="top"
        content={displayContent}
        onContentChange={onChange}
      />
      <EditorContent 
        editor={editor} 
        className={editorContentClassName}
        placeholder={placeholder}
      />
      {showBottomToolbar && (
        <EditorToolbar
          editor={editor}
          trackingEnabled={false}
          userInitials={userInitials}
          onToggleTracking={() => {}}
          position="bottom"
          content={displayContent}
          onContentChange={onChange}
        />
      )}
      <EditorStyles />
    </EditorContainer>
  );
}
