
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { FormattingButtons } from './toolbar/FormattingButtons';
import { AlignmentButtons } from './toolbar/AlignmentButtons';
import { ListButtons } from './toolbar/ListButtons';
import { ColorButtons } from './toolbar/ColorButtons';
import { UndoRedoButtons } from './toolbar/UndoRedoButtons';
import { ToolbarDivider } from './toolbar/ToolbarDivider';
import { TrackingButton } from './toolbar/TrackingButton';

interface EditorToolbarProps {
  editor: Editor;
  trackingEnabled: boolean;
  userInitials: string;
  onToggleTracking: () => void;
  position?: 'top' | 'bottom';
  content: string;
  onContentChange: (content: string) => void;
  showTrackingToggle?: boolean;
}

export function EditorToolbar({ 
  editor, 
  trackingEnabled, 
  userInitials, 
  onToggleTracking, 
  position = 'top',
  content,
  onContentChange,
  showTrackingToggle = false
}: EditorToolbarProps) {
  const toolbarClassName = cn(
    "flex flex-wrap items-center gap-1 p-2 border-gray-200 bg-gray-50",
    position === 'top' ? "border-b" : "border-t"
  );

  return (
    <div className={toolbarClassName}>
      <UndoRedoButtons editor={editor} />
      <ToolbarDivider />
      
      <FormattingButtons editor={editor} />
      <ToolbarDivider />
      
      <AlignmentButtons editor={editor} />
      <ToolbarDivider />
      
      <ListButtons editor={editor} />
      <ToolbarDivider />
      
      <ColorButtons editor={editor} />
      
      {showTrackingToggle && (
        <>
          <ToolbarDivider />
          <TrackingButton 
            trackingEnabled={trackingEnabled}
            onToggleTracking={onToggleTracking}
          />
        </>
      )}
    </div>
  );
}
