
import { Editor } from '@tiptap/react';
import { FormattingButtons } from './toolbar/FormattingButtons';
import { AlignmentButtons } from './toolbar/AlignmentButtons';
import { ListButtons } from './toolbar/ListButtons';
import { ColorButtons } from './toolbar/ColorButtons';
import { UndoRedoButtons } from './toolbar/UndoRedoButtons';
import { TrackingButton } from './toolbar/TrackingButton';
import { AIIntegratedToolbar } from './AIIntegratedToolbar';
import { ToolbarDivider } from './toolbar/ToolbarDivider';

interface EditorToolbarProps {
  editor: Editor | null;
  trackingEnabled: boolean;
  userInitials: string;
  onToggleTracking: () => void;
  position: 'top' | 'bottom';
  content: string;
  onContentChange: (content: string) => void;
  showTrackingToggle?: boolean;
  onAISuggestion?: (changeId: string, operation: string, originalText: string, suggestedText: string) => void;
  context?: string;
}

export function EditorToolbar({
  editor,
  trackingEnabled,
  userInitials,
  onToggleTracking,
  position,
  showTrackingToggle = false,
  onAISuggestion,
  context
}: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className={`border-gray-200 p-2 flex flex-wrap gap-1 items-center ${
      position === 'top' ? 'border-b' : 'border-t'
    }`}>
      <FormattingButtons editor={editor} />
      <ToolbarDivider />
      <AlignmentButtons editor={editor} />
      <ToolbarDivider />
      <ListButtons editor={editor} />
      <ToolbarDivider />
      <ColorButtons editor={editor} />
      <ToolbarDivider />
      <UndoRedoButtons editor={editor} />
      
      {showTrackingToggle && (
        <>
          <ToolbarDivider />
          <TrackingButton
            trackingEnabled={trackingEnabled}
            userInitials={userInitials}
            onToggleTracking={onToggleTracking}
          />
        </>
      )}
      
      <ToolbarDivider />
      <AIIntegratedToolbar
        editor={editor}
        userInitials={userInitials}
        onAISuggestion={onAISuggestion}
        context={context}
      />
    </div>
  );
}
