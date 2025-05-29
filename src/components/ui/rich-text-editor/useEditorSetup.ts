
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Addition } from '../tiptap-extensions/AdditionMark';
import { Deletion } from '../tiptap-extensions/DeletionMark';
import { useMemo } from 'react';
import { isValidTipTapJson, migrateHtmlToJson } from '@/utils/trackingUtils';

interface UseEditorSetupProps {
  content: string;
  onChange: (content: string) => void;
  isJsonMode: boolean;
}

export function useEditorSetup({ content, onChange, isJsonMode }: UseEditorSetupProps) {
  // Determine if content is JSON or HTML and prepare initial content
  const getInitialContent = useMemo(() => {
    if (!content) return '';
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      if (isValidTipTapJson(parsed)) {
        return parsed;
      }
    } catch {
      // Not JSON, treat as HTML
    }
    
    // If it's HTML, migrate to JSON format
    if (content.includes('<') && content.includes('>')) {
      return migrateHtmlToJson(content);
    }
    
    // Plain text
    return content;
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Addition,
      Deletion,
    ],
    content: getInitialContent,
    onUpdate: ({ editor }) => {
      const updatedContent = isJsonMode 
        ? JSON.stringify(editor.getJSON())
        : editor.getHTML();
      onChange(updatedContent);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 leading-relaxed',
        style: 'line-height: 1.8;',
      },
    },
  });

  return editor;
}
