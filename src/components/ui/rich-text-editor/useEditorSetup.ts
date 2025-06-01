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

// Enhanced HTML stripping function
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Remove HTML tags completely
  let cleanText = html.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanText;
  cleanText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up multiple spaces and line breaks
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText;
};

// Convert TipTap JSON to plain text
const extractTextFromJson = (jsonContent: any): string => {
  if (!jsonContent || typeof jsonContent !== 'object') return '';
  
  if (jsonContent.type === 'text') {
    return jsonContent.text || '';
  }
  
  if (jsonContent.content && Array.isArray(jsonContent.content)) {
    return jsonContent.content.map(extractTextFromJson).join(' ');
  }
  
  return '';
};

export function useEditorSetup({ content, onChange, isJsonMode }: UseEditorSetupProps) {
  // Clean and prepare initial content
  const getInitialContent = useMemo(() => {
    if (!content) return '';
    
    console.log('Processing initial content:', content);
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      if (isValidTipTapJson(parsed)) {
        const plainText = extractTextFromJson(parsed);
        console.log('Extracted text from JSON:', plainText);
        return plainText;
      }
    } catch {
      // Not JSON, continue processing
    }
    
    // If content contains HTML tags, strip them completely
    if (content.includes('<') && content.includes('>')) {
      const cleanText = stripHtmlTags(content);
      console.log('Stripped HTML, result:', cleanText);
      return cleanText;
    }
    
    // Return as plain text
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
      // Always output as clean plain text
      const plainText = editor.getText();
      console.log('Editor updated, outputting plain text:', plainText);
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
      
      // Clean the incoming content before comparing
      let cleanIncomingContent = content;
      
      // Strip HTML if present
      if (content.includes('<') && content.includes('>')) {
        cleanIncomingContent = stripHtmlTags(content);
      }
      
      // Try to extract from JSON if it's TipTap JSON
      try {
        const parsed = JSON.parse(content);
        if (isValidTipTapJson(parsed)) {
          cleanIncomingContent = extractTextFromJson(parsed);
        }
      } catch {
        // Not JSON, use the cleaned content
      }
      
      // Only update if the content is different from what's currently in the editor
      if (currentText !== cleanIncomingContent) {
        console.log('Updating editor content:', { currentText, newContent: cleanIncomingContent });
        editor.commands.setContent(cleanIncomingContent);
      }
    }
  }, [editor, content]);

  return editor;
}
