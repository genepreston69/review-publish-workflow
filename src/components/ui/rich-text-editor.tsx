
import { EditorContent } from '@tiptap/react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserInitials, isValidTipTapJson } from '@/utils/trackingUtils';
import { cn } from '@/lib/utils';
import { EditorToolbar } from './rich-text-editor/EditorToolbar';
import { EditorStyles } from './rich-text-editor/EditorStyles';
import { useEditorSetup } from './rich-text-editor/useEditorSetup';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  context?: string;
  showBottomToolbar?: boolean;
  isEditMode?: boolean;
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

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder, 
  className, 
  context,
  showBottomToolbar = false,
  isEditMode = false
}: RichTextEditorProps) {
  const auth = useAuth();
  const [userInitials, setUserInitials] = useState<string>('U');
  const [isJsonMode, setIsJsonMode] = useState<boolean>(false);

  // Debug log to verify edit mode is being passed correctly
  console.log('RichTextEditor - isEditMode:', isEditMode);

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
    
    if (content.includes('<') && content.includes('>')) {
      setIsJsonMode(true);
    }
  }, [content]);

  // Always clean the content for display - aggressively strip any HTML
  const displayContent = useMemo(() => {
    if (!content) return '';
    
    console.log('Processing display content:', content);
    
    // Try to extract from JSON first
    try {
      const parsed = JSON.parse(content);
      if (isValidTipTapJson(parsed)) {
        const plainText = extractTextFromJson(parsed);
        console.log('Extracted from JSON:', plainText);
        return plainText;
      }
    } catch {
      // Not JSON, continue
    }
    
    // If content contains any HTML, strip it completely
    if (content.includes('<') || content.includes('>') || content.includes('&')) {
      const cleanText = stripHtmlTags(content);
      console.log('Stripped HTML:', cleanText);
      return cleanText;
    }
    
    return content;
  }, [content]);

  const editor = useEditorSetup({ 
    content: displayContent, 
    onChange, 
    isJsonMode 
  });

  if (!editor) {
    return null;
  }

  const editorContentClassName = cn(
    "min-h-[200px]",
    isEditMode && "edit-mode-text"
  );

  console.log('Editor content className:', editorContentClassName);

  return (
    <div className={cn(
      "border rounded-md transition-colors",
      isEditMode && "border-orange-300 ring-1 ring-orange-200 bg-orange-50/30",
      className
    )}>
      {isEditMode && (
        <div className="px-3 py-2 border-b border-orange-200 bg-orange-100/50">
          <span className="text-xs font-medium text-orange-700">Edit Mode Active</span>
        </div>
      )}
      <EditorToolbar
        editor={editor}
        trackingEnabled={false}
        userInitials={userInitials}
        onToggleTracking={() => {}}
        position="top"
        content={displayContent}
        onContentChange={onChange}
      />
      <EditorContent 
        editor={editor} 
        className={editorContentClassName}
        placeholder={placeholder}
      />
      {showBottomToolbar && (
        <EditorToolbar
          editor={editor}
          trackingEnabled={false}
          userInitials={userInitials}
          onToggleTracking={() => {}}
          position="bottom"
          content={displayContent}
          onContentChange={onChange}
        />
      )}
      <EditorStyles />
    </div>
  );
}
