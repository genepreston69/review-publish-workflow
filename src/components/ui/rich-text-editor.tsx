
import { useEditor, EditorContent } from '@tiptap/react';
import { AIWritingAssistant } from '@/components/ui/ai-writing-assistant';
import { RichTextEditorToolbar } from '@/components/ui/rich-text-editor-toolbar';
import { getEditorExtensions, getEditorProps } from '@/utils/editor-config';
import { getPlainTextFromEditor, handleAITextChange } from '@/utils/editor-ai-utils';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  context?: string;
}

export function RichTextEditor({ content, onChange, placeholder, className, context }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: getEditorExtensions(),
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: getEditorProps(),
  });

  if (!editor) {
    return null;
  }

  const onAITextChange = (improvedText: string) => {
    handleAITextChange(editor, improvedText, onChange);
  };

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="border-b p-2 flex flex-wrap gap-1 justify-between">
        <RichTextEditorToolbar editor={editor} />
        
        <AIWritingAssistant
          text={getPlainTextFromEditor(editor)}
          onChange={onAITextChange}
          context={context}
        />
      </div>
      <EditorContent 
        editor={editor} 
        className="min-h-[200px]"
        placeholder={placeholder}
      />
    </div>
  );
}
