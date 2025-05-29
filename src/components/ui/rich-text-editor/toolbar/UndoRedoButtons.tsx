
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Undo, Redo } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface UndoRedoButtonsProps {
  editor: Editor;
}

export function UndoRedoButtons({ editor }: UndoRedoButtonsProps) {
  // Add console logging to debug undo/redo functionality
  const handleUndo = () => {
    console.log('Undo button clicked');
    console.log('Can undo:', editor.can().undo());
    console.log('History state:', editor.state.history);
    
    const result = editor.chain().focus().undo().run();
    console.log('Undo command result:', result);
  };

  const handleRedo = () => {
    console.log('Redo button clicked');
    console.log('Can redo:', editor.can().redo());
    
    const result = editor.chain().focus().redo().run();
    console.log('Redo command result:', result);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo (Ctrl+Z)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo (Ctrl+Y)</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
