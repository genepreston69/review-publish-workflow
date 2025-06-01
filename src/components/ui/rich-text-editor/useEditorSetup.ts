

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { Suggestion } from '../tiptap-extensions/SuggestionMark';
import { Addition } from '../tiptap-extensions/AdditionMark';
import { Deletion } from '../tiptap-extensions/DeletionMark';
import { useMemo, useEffect } from 'react';
import { isValidTipTapJson, migrateHtmlToJson } from '@/utils/trackingUtils';

interface UseEditorSetupProps {
  content: string;
  onChange: (content: string) => void;
  isJsonMode: boolean;
}

// Helper function to strip HTML tags and return clean text
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content and clean up
  let textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up multiple spaces and line breaks
  textContent = textContent.replace(/\s+/g, ' ').trim();
  
  return textContent;
};

export function useEditorSetup({ content, onChange, isJsonMode }: UseEditorSetupProps) {
  // Determine if content is JSON or HTML and prepare initial content
  const getInitialContent = useMemo(() => {
    if (!content) return '';
    
    // If content contains HTML tags, strip them and show as plain text
    if (content.includes('<') && content.includes('>') && !content.includes('"type":')) {
      const cleanText = stripHtmlTags(content);
      return cleanText;
    }
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      if (isValidTipTapJson(parsed)) {
        return parsed;
      }
    } catch {
      // Not JSON, treat as plain text
    }
    
    // If it's TipTap JSON format, migrate to proper format
    if (content.includes('<') && content.includes('>')) {
      return migrateHtmlToJson(content);
    }
    
    // Plain text
    return content;
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable default list extensions to configure them separately
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      // Configure list extensions separately for better control
      ListItem.configure({
        HTMLAttributes: {
          class: 'editor-list-item',
        },
      }),
      BulletList.configure({
        keepMarks: true,
        keepAttributes: false,
        HTMLAttributes: {
          class: 'editor-bullet-list',
        },
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: false,
        HTMLAttributes: {
          class: 'editor-ordered-list',
        },
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // New unified suggestion system
      Suggestion,
      // Keep legacy extensions for backward compatibility
      Addition,
      Deletion,
    ],
    content: getInitialContent,
    onUpdate: ({ editor }) => {
      // Always output as clean text to suppress HTML
      const plainText = editor.getText();
      onChange(plainText);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 leading-relaxed',
        style: 'line-height: 1.8;',
      },
    },
  });

  // Update editor content when external content changes (like AI suggestions)
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentText = editor.getText();
      // Only update if the content is different from what's currently in the editor
      if (currentText !== content) {
        console.log('Updating editor content:', { currentText, newContent: content });
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  return editor;
}

