
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Editor } from '@tiptap/react';

interface ColorButtonsProps {
  editor: Editor;
}

export function ColorButtons({ editor }: ColorButtonsProps) {
  const colors = [
    { name: 'Blue', value: '#1d4ed8', label: 'Blue text' },
    { name: 'Red', value: '#dc2626', label: 'Red text' },
    { name: 'Green', value: '#15803d', label: 'Green text' },
  ];

  const handleColorClick = (color: string) => {
    // First focus the editor to ensure proper state
    editor.chain().focus().run();
    
    // If the same color is already active, unset it (toggle behavior)
    if (editor.isActive('textStyle', { color: color })) {
      editor.chain().focus().unsetColor().run();
    } else {
      // Clear any existing color first, then set the new color
      editor.chain().focus().unsetColor().setColor(color).run();
    }
  };

  return (
    <>
      {colors.map((color) => (
        <Tooltip key={color.name}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleColorClick(color.value)}
              className={`w-8 h-8 p-0 rounded-full border-2 ${
                editor.isActive('textStyle', { color: color.value })
                  ? 'border-gray-400 ring-2 ring-gray-300'
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: color.value }}
            >
              <span className="sr-only">{color.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{color.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </>
  );
}
