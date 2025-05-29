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
import { ChangeTrackingExtension, ChangeTrackingOptions } from '../tiptap-extensions/ChangeTrackingPlugin';
import { useMemo } from 'react';
import { isValidTipTapJson, migrateHtmlToJson } from '@/utils/trackingUtils';

interface UseEditorSetupProps {
  content: string;
  onChange: (content: string) => void;
  isJsonMode: boolean;
  trackingOptions: ChangeTrackingOptions;
}

export function useEditorSetup({ content, onChange, isJsonMode, trackingOptions }: UseEditorSetupProps) {
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

  // Create extensions array - always include change tracking extension
  const extensions = useMemo(() => {
    return [
      StarterKit.configure({
        // Disable default list extensions to configure them separately
        bulletList: false,
        orderedList: false,
        listItem: false,
        // Configure history with optimized settings for change tracking
        history: {
          depth: 100,
          newGroupDelay: 500,
        },
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
      // Always include change tracking extension, controlled by options
      ChangeTrackingExtension.configure(trackingOptions),
    ];
  }, [trackingOptions]);

  const editor = useEditor({
    extensions,
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
    // Optimized parse options for change tracking
    parseOptions: {
      preserveWhitespace: 'full',
    },
    // Enable all input rules and paste rules for natural editing
    enableInputRules: true,
    enablePasteRules: true,
    // Ensure proper transaction handling for undo/redo
    enableContentCheck: true,
  }, [extensions, getInitialContent, isJsonMode, onChange]);

  return editor;
}
