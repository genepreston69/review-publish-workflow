
import { TooltipProvider } from '@/components/ui/tooltip';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { FormattingButtons } from './toolbar/FormattingButtons';
import { ColorButtons } from './toolbar/ColorButtons';
import { ListButtons } from './toolbar/ListButtons';
import { AlignmentButtons } from './toolbar/AlignmentButtons';
import { UndoRedoButtons } from './toolbar/UndoRedoButtons';
import { ToolbarDivider } from './toolbar/ToolbarDivider';

interface EditorToolbarProps {
  editor: Editor;
  trackingEnabled: boolean;
  userInitials: string;
  onToggleTracking: () => void;
  position?: 'top' | 'bottom';
}

export function EditorToolbar({
  editor,
  trackingEnabled,
  userInitials,
  onToggleTracking,
  position = 'top'
}: EditorToolbarProps) {
  const borderClass = position === 'top' ? 'border-b' : 'border-t';
  
  return (
    <TooltipProvider>
      <div className={cn("p-2 flex flex-wrap gap-1", borderClass)}>
        <FormattingButtons editor={editor} />
        
        <ToolbarDivider />
        
        <ColorButtons editor={editor} />
        
        <ToolbarDivider />
        
        <ListButtons editor={editor} />
        
        <ToolbarDivider />
        
        <AlignmentButtons editor={editor} />
        
        <ToolbarDivider />
        
        <UndoRedoButtons editor={editor} />
      </div>
    </TooltipProvider>
  );
}
