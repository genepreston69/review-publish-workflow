
import { Editor } from '@tiptap/react';

export const getPlainTextFromEditor = (editor: Editor): string => {
  return editor.getText();
};

export const handleAITextChange = (
  editor: Editor, 
  improvedText: string, 
  onChange: (content: string) => void
): void => {
  // Convert plain text back to HTML while preserving basic formatting
  const htmlContent = improvedText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  const wrappedContent = `<p>${htmlContent}</p>`;
  
  editor.commands.setContent(wrappedContent);
  onChange(wrappedContent);
};
