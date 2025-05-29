
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Undo, Redo } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface UndoRedoButtonsProps {
  editor: Editor;
}

export function UndoRedoButtons({ editor }: UndoRedoButtonsProps) {
  const handleUndo = () => {
    console.log('Undo button clicked');
    editor.chain().focus().undo().run();
  };

  const handleRedo = () => {
    console.log('Redo button clicked');
    editor.chain().focus().redo().run();
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
