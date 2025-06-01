
import { TooltipProvider } from '@/components/ui/tooltip';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { FormattingButtons } from './toolbar/FormattingButtons';
import { ColorButtons } from './toolbar/ColorButtons';
import { ListButtons } from './toolbar/ListButtons';
import { AlignmentButtons } from './toolbar/AlignmentButtons';
import { UndoRedoButtons } from './toolbar/UndoRedoButtons';
import { ToolbarDivider } from './toolbar/ToolbarDivider';
import { AIWritingAssistant } from '@/components/ui/ai-writing-assistant';

interface EditorToolbarProps {
  editor: Editor;
  trackingEnabled: boolean;
  userInitials: string;
  onToggleTracking: () => void;
  position?: 'top' | 'bottom';
  content?: string;
  onContentChange?: (content: string) => void;
}

export function EditorToolbar({
  editor,
  trackingEnabled,
  userInitials,
  onToggleTracking,
  position = 'top',
  content = '',
  onContentChange
}: EditorToolbarProps) {
  const borderClass = position === 'top' ? 'border-b' : 'border-t';
  
  return (
    <TooltipProvider>
      <div className={cn("p-2 flex flex-wrap gap-1 justify-between", borderClass)}>
        <div className="flex flex-wrap gap-1">
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
        
        {onContentChange && (
          <AIWritingAssistant
            text={content}
            onChange={onContentChange}
            context="policy content"
            className="ml-auto"
          />
        )}
      </div>
    </TooltipProvider>
  );
}
