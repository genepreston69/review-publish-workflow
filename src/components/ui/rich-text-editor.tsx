

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import { AIWritingAssistant } from '@/components/ui/ai-writing-assistant';
import { Addition } from './tiptap-extensions/AdditionMark';
import { Deletion } from './tiptap-extensions/DeletionMark';
import { createChangeTrackingPlugin, changeTrackingPluginKey } from './tiptap-extensions/ChangeTrackingPlugin';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserInitials, isValidTipTapJson, migrateHtmlToJson } from '@/utils/trackingUtils';
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
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  context?: string;
}

export function RichTextEditor({ content, onChange, placeholder, className, context }: RichTextEditorProps) {
  const auth = useAuth();
  const [userInitials, setUserInitials] = useState<string>('U');
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(true);
  const [isJsonMode, setIsJsonMode] = useState<boolean>(false);
  const trackingPluginRef = useRef<any>(null);

  // Load user initials from profile
  useEffect(() => {
    const loadUserInitials = async () => {
      if (!auth?.currentUser?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', auth.currentUser.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          setUserInitials(getUserInitials(undefined, auth.currentUser.email));
          return;
        }

        // For now, generate initials from name/email since the column doesn't exist yet
        const initials = getUserInitials(profile?.name, profile?.email || auth.currentUser.email);
        setUserInitials(initials);
      } catch (error) {
        console.error('Error loading user initials:', error);
        setUserInitials(getUserInitials(undefined, auth.currentUser.email));
      }
    };

    loadUserInitials();
  }, [auth?.currentUser]);

  // Determine if content is JSON or HTML and prepare initial content
  const getInitialContent = () => {
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
  };

  // Set JSON mode based on content type
  useEffect(() => {
    if (!content) return;
    
    try {
      const parsed = JSON.parse(content);
      if (isValidTipTapJson(parsed)) {
        setIsJsonMode(true);
        return;
      }
    } catch {
      // Not JSON
    }
    
    // If it's HTML, set JSON mode
    if (content.includes('<') && content.includes('>')) {
      setIsJsonMode(true);
    }
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
    content: getInitialContent(),
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

  // Manage change tracking plugin
  useEffect(() => {
    if (!editor) return;

    const updateTrackingPlugin = () => {
      // Remove existing plugin if it exists
      if (trackingPluginRef.current) {
        const currentState = editor.state;
        const currentPlugins = currentState.plugins;
        const filteredPlugins = currentPlugins.filter(
          plugin => plugin.spec?.key !== changeTrackingPluginKey
        );
        
        // Reconfigure editor with filtered plugins
        const newState = currentState.reconfigure({
          plugins: filteredPlugins
        });
        editor.view.updateState(newState);
        trackingPluginRef.current = null;
      }

      // Add new plugin if tracking is enabled
      if (trackingEnabled) {
        const plugin = createChangeTrackingPlugin({
          userInitials,
          enabled: trackingEnabled,
        });
        
        trackingPluginRef.current = plugin;
        editor.registerPlugin(plugin);
      }
    };

    updateTrackingPlugin();

    // Cleanup function
    return () => {
      if (trackingPluginRef.current && editor) {
        try {
          const currentState = editor.state;
          const currentPlugins = currentState.plugins;
          const filteredPlugins = currentPlugins.filter(
            plugin => plugin.spec?.key !== changeTrackingPluginKey
          );
          
          const newState = currentState.reconfigure({
            plugins: filteredPlugins
          });
          editor.view.updateState(newState);
        } catch (error) {
          console.error('Error cleaning up tracking plugin:', error);
        }
        trackingPluginRef.current = null;
      }
    };
  }, [editor, userInitials, trackingEnabled]);

  if (!editor) {
    return null;
  }

  // Extract plain text for AI processing
  const getPlainText = () => {
    return editor.getText();
  };

  // Handle AI-improved text
  const handleAITextChange = (improvedText: string) => {
    if (trackingEnabled) {
      // When tracking is enabled, mark AI improvements as additions
      const changeId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      // Clear current content and add new content with tracking
      editor.commands.selectAll();
      editor.commands.deleteSelection();
      
      // Insert new content as tracked addition
      editor.commands.insertContent({
        type: 'text',
        text: improvedText,
        marks: [
          {
            type: 'addition',
            attrs: {
              changeId,
              userInitials: 'AI',
              timestamp,
            },
          },
        ],
      });
    } else {
      // Convert plain text back to content
      const htmlContent = improvedText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
      const wrappedContent = `<p>${htmlContent}</p>`;
      
      editor.commands.setContent(wrappedContent);
    }
  };

  const toggleTracking = () => {
    setTrackingEnabled(!trackingEnabled);
  };

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="border-b p-2 flex flex-wrap gap-1 justify-between">
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-gray-200' : ''}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-gray-200' : ''}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            type="button"
            variant={trackingEnabled ? "default" : "ghost"}
            size="sm"
            onClick={toggleTracking}
            title={trackingEnabled ? "Disable Change Tracking" : "Enable Change Tracking"}
          >
            {trackingEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {trackingEnabled && (
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              Tracking: {userInitials}
            </span>
          )}
          <AIWritingAssistant
            text={getPlainText()}
            onChange={handleAITextChange}
            context={context}
          />
        </div>
      </div>
      <EditorContent 
        editor={editor} 
        className="min-h-[200px]"
        placeholder={placeholder}
      />
      
      <style>{`
        .tracked-addition {
          position: relative;
        }
        
        .tracked-deletion {
          position: relative;
        }
        
        .tracked-initials {
          pointer-events: none;
          user-select: none;
        }
        
        .ProseMirror .tracked-addition strong {
          background-color: rgba(34, 139, 34, 0.1);
          padding: 1px 2px;
          border-radius: 2px;
        }
        
        .ProseMirror .tracked-deletion s {
          background-color: rgba(178, 34, 34, 0.1);
          padding: 1px 2px;
          border-radius: 2px;
        }
        
        @media print {
          .tracked-addition strong {
            background-color: transparent !important;
            font-weight: bold;
          }
          
          .tracked-deletion s {
            background-color: transparent !important;
            text-decoration: line-through;
          }
          
          .tracked-initials {
            font-size: 0.6em !important;
          }
        }
      `}</style>
    </div>
  );
}

