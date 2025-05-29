
import { AIWritingAssistant } from '@/components/ui/ai-writing-assistant';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { FormattingButtons } from './toolbar/FormattingButtons';
import { ListButtons } from './toolbar/ListButtons';
import { AlignmentButtons } from './toolbar/AlignmentButtons';
import { UndoRedoButtons } from './toolbar/UndoRedoButtons';
import { TrackingButton } from './toolbar/TrackingButton';
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
          
          <ListButtons editor={editor} />
          
          <ToolbarDivider />
          
          <AlignmentButtons editor={editor} />
          
          <ToolbarDivider />
          
          <UndoRedoButtons editor={editor} />
          
          <ToolbarDivider />
          
          <TrackingButton 
            trackingEnabled={trackingEnabled} 
            onToggleTracking={onToggleTracking} 
          />
        </div>
        
        <div className="flex items-center gap-2">
          {trackingEnabled && (
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              Tracking: {userInitials}
            </span>
          )}
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
