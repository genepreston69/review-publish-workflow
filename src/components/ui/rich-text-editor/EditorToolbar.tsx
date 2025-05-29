
import { Button } from '@/components/ui/button';
import { AIWritingAssistant } from '@/components/ui/ai-writing-assistant';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';

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
    <TooltipProvider>
      <div className={cn("p-2 flex flex-wrap gap-1 justify-between", borderClass)}>
        <div className="flex flex-wrap gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-gray-200' : ''}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold (Ctrl+B)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-gray-200' : ''}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic (Ctrl+I)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'bg-gray-200' : ''}
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Underline (Ctrl+U)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'bg-gray-200' : ''}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Strikethrough</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-gray-300 mx-1" />

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

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Left</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Center</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Right</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
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
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={trackingEnabled ? "default" : "ghost"}
                size="sm"
                onClick={onToggleTracking}
              >
                {trackingEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{trackingEnabled ? "Disable Change Tracking" : "Enable Change Tracking"}</p>
            </TooltipContent>
          </Tooltip>
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
