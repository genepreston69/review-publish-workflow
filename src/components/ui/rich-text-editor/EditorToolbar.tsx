
import { AIWritingAssistant } from '@/components/ui/ai-writing-assistant';
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
  onAITextChange: (text: string) => void;
  getPlainText: () => string;
  context?: string;
  position?: 'top' | 'bottom';
}

export function EditorToolbar({
  editor,
  trackingEnabled,
  userInitials,
  onToggleTracking,
  onAITextChange,
  getPlainText,
  context,
  position = 'top'
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
        
        <div className="flex items-center gap-2">
          <AIWritingAssistant
            text={getPlainText()}
            onChange={onAITextChange}
            context={context}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
