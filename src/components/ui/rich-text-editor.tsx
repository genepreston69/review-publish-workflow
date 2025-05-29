import { EditorContent } from '@tiptap/react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserInitials, isValidTipTapJson } from '@/utils/trackingUtils';
import { cn } from '@/lib/utils';
import { EditorToolbar } from './rich-text-editor/EditorToolbar';
import { EditorStyles } from './rich-text-editor/EditorStyles';
import { useEditorSetup } from './rich-text-editor/useEditorSetup';
import { useChangeTracking } from './rich-text-editor/useChangeTracking';
import { createPortal } from 'react-dom';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  context?: string;
  globalFixed?: boolean;
}

export function RichTextEditor({ content, onChange, placeholder, className, context, globalFixed = false }: RichTextEditorProps) {
  const auth = useAuth();
  const [userInitials, setUserInitials] = useState<string>('U');
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(true);
  const [isJsonMode, setIsJsonMode] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

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

  const editor = useEditorSetup({ content, onChange, isJsonMode });

  // Use change tracking hook
  useChangeTracking({ editor, userInitials, trackingEnabled });

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

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Small delay to check if focus moved to toolbar
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isToolbarElement = activeElement?.closest('[data-global-toolbar]');
      if (!isToolbarElement) {
        setIsFocused(false);
      }
    }, 100);
  };

  const toolbar = (
    <div 
      className="bg-white border-b shadow-sm p-2" 
      data-global-toolbar
      onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking toolbar
    >
      <EditorToolbar
        editor={editor}
        trackingEnabled={trackingEnabled}
        userInitials={userInitials}
        onToggleTracking={toggleTracking}
        onAITextChange={handleAITextChange}
        getPlainText={getPlainText}
        context={context}
      />
    </div>
  );

  return (
    <>
      {globalFixed && isFocused && createPortal(
        <div className="fixed top-0 left-0 right-0 z-50">
          {toolbar}
        </div>,
        document.body
      )}
      
      <div 
        className={cn(
          "border rounded-md flex flex-col", 
          className,
          globalFixed && isFocused && "mt-[60px]" // Add margin when global toolbar is shown
        )}
      >
        {!globalFixed && (
          <div className="sticky top-0 z-10 bg-white border-b rounded-t-md">
            {toolbar}
          </div>
        )}
        
        <div className="flex-1 overflow-auto">
          <EditorContent 
            editor={editor} 
            className="min-h-[200px]"
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <EditorStyles />
      </div>
    </>
  );
}
