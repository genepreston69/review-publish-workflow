
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { List, ListOrdered, Quote } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface ListButtonsProps {
  editor: Editor;
}

export function ListButtons({ editor }: ListButtonsProps) {
  const handleBulletListClick = () => {
    console.log('Bullet list button clicked');
    console.log('Editor can toggle bullet list:', editor.can().toggleBulletList());
    console.log('Current bullet list state:', editor.isActive('bulletList'));
    
    try {
      editor.chain().focus().toggleBulletList().run();
      console.log('Bullet list command executed');
      console.log('New bullet list state:', editor.isActive('bulletList'));
    } catch (error) {
      console.error('Error toggling bullet list:', error);
    }
  };

  const handleOrderedListClick = () => {
    console.log('Ordered list button clicked');
    console.log('Editor can toggle ordered list:', editor.can().toggleOrderedList());
    console.log('Current ordered list state:', editor.isActive('orderedList'));
    
    try {
      editor.chain().focus().toggleOrderedList().run();
      console.log('Ordered list command executed');
      console.log('New ordered list state:', editor.isActive('orderedList'));
    } catch (error) {
      console.error('Error toggling ordered list:', error);
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBulletListClick}
            className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bullet List</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleOrderedListClick}
            className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Numbered List</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Blockquote</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
