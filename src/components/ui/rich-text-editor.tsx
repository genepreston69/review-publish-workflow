
import { useEditor, EditorContent } from '@tiptap/react';
import { AIWritingAssistant } from '@/components/ui/ai-writing-assistant';
import { AISuggestionPreview } from '@/components/ui/ai-suggestion-preview';
import { RichTextEditorToolbar } from '@/components/ui/rich-text-editor-toolbar';
import { getEditorExtensions, getEditorProps } from '@/utils/editor-config';
import { getPlainTextFromEditor, handleAITextChange } from '@/utils/editor-ai-utils';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  context?: string;
}

export function RichTextEditor({ content, onChange, placeholder, className, context }: RichTextEditorProps) {
  const { currentSuggestion, isPreviewOpen, showSuggestion, closeSuggestion, clearSuggestion } = useAISuggestions();
  
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

  const handleSuggestionReady = (suggestion: {
    originalText: string;
    suggestedText: string;
    operationType: string;
    operationDescription: string;
  }) => {
    showSuggestion(suggestion);
  };

  const handleAcceptSuggestion = (finalText: string) => {
    handleAITextChange(editor, finalText, onChange);
    clearSuggestion();
  };

  const handleRejectSuggestion = () => {
    clearSuggestion();
  };

  return (
    <>
      <div className={cn("border rounded-md", className)}>
        <div className="border-b p-2 flex flex-wrap gap-1 justify-between">
          <RichTextEditorToolbar editor={editor} />
          
          <AIWritingAssistant
            text={getPlainTextFromEditor(editor)}
            onSuggestionReady={handleSuggestionReady}
            context={context}
          />
        </div>
        <EditorContent 
          editor={editor} 
          className="min-h-[200px]"
          placeholder={placeholder}
        />
      </div>

      {currentSuggestion && (
        <AISuggestionPreview
          isOpen={isPreviewOpen}
          onClose={closeSuggestion}
          originalText={currentSuggestion.originalText}
          suggestedText={currentSuggestion.suggestedText}
          operationType={currentSuggestion.operationType}
          operationDescription={currentSuggestion.operationDescription}
          onAccept={handleAcceptSuggestion}
          onReject={handleRejectSuggestion}
        />
      )}
    </>
  );
}
