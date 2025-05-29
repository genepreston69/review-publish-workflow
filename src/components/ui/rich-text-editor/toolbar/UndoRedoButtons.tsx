
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Undo, Redo } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface UndoRedoButtonsProps {
  editor: Editor;
}

export function UndoRedoButtons({ editor }: UndoRedoButtonsProps) {
  const handleUndo = () => {
    console.log('Undo action triggered');
    editor.chain().focus().undo().run();
  };

  const handleRedo = () => {
    console.log('Redo action triggered');
    editor.chain().focus().redo().run();
  };

  // Check if undo/redo operations are available
  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            className={!canUndo ? 'opacity-50 cursor-not-allowed' : ''}
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
            disabled={!canRedo}
            className={!canRedo ? 'opacity-50 cursor-not-allowed' : ''}
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
