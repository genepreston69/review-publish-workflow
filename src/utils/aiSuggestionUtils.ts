import { generateChangeId } from './trackingUtils';

export interface AISuggestionResponse {
  improvedText: string;
}

// Function to get AI suggestions for selected text
export const getAISuggestion = async (
  text: string, 
  operation: string, 
  context?: string
): Promise<string> => {
  try {
    const response = await fetch('/api/ai-writing-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        operation,
        context
      })
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data: AISuggestionResponse = await response.json();
    return data.improvedText;
  } catch (error) {
    console.error('Error getting AI suggestion:', error);
    throw error;
  }
};

// Function to replace selected text with AI suggestion
export const replaceWithAISuggestion = (
  editor: any, 
  improvedText: string
) => {
  if (!editor) return;

  const { from, to } = editor.state.selection;
  
  // Replace the selected text
  editor.chain()
    .focus()
    .deleteRange({ from, to })
    .insertContentAt(from, improvedText)
    .run();
};

// Function to show AI suggestion as a tracked change
export const showAISuggestionAsTrackChange = (
  editor: any,
  originalText: string,
  improvedText: string,
  userInitials: string,
  operation: string
) => {
  if (!editor) return;

  const { from, to } = editor.state.selection;
  const changeId = generateChangeId();
  
  // Add suggestion mark to show the change
  editor.chain()
    .focus()
    .setTextSelection({ from, to })
    .setSuggestion({
      changeId,
      userInitials: `AI-${userInitials}`,
      originalText,
      suggestedText: improvedText,
      timestamp: new Date().toISOString(),
      changeType: 'replace'
    })
    .run();

  return changeId;
};

// Function to accept a suggestion (replace with improved text)
export const acceptSuggestion = (
  editor: any,
  suggestionId: string,
  improvedText: string
) => {
  if (!editor) return;

  const { state } = editor;
  const { doc } = state;
  
  doc.descendants((node: any, pos: number) => {
    if (node.marks) {
      const suggestionMark = node.marks.find(
        (mark: any) => mark.type.name === 'suggestion' && mark.attrs.changeId === suggestionId
      );
      
      if (suggestionMark) {
        const from = pos;
        const to = pos + node.nodeSize;
        
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .unsetSuggestion()
          .insertContent(improvedText)
          .run();
        
        return false; // Stop traversing
      }
    }
  });
};

// Function to reject a suggestion (remove the suggestion mark)
export const rejectSuggestion = (
  editor: any,
  suggestionId: string
) => {
  if (!editor) return;

  const { state } = editor;
  const { doc } = state;
  
  doc.descendants((node: any, pos: number) => {
    if (node.marks) {
      const suggestionMark = node.marks.find(
        (mark: any) => mark.type.name === 'suggestion' && mark.attrs.changeId === suggestionId
      );
      
      if (suggestionMark) {
        const from = pos;
        const to = pos + node.nodeSize;
        
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .unsetSuggestion()
          .run();
        
        return false; // Stop traversing
      }
    }
  });
};

// Accept all suggestions and remove suggestion marks
export const acceptAllSuggestions = (editor: any) => {
  if (!editor) return;

  const { state } = editor;
  const { doc } = state;
  const changes: Array<{ from: number; to: number; suggestedText: string }> = [];

  // Collect all suggestion marks and their positions
  doc.descendants((node: any, pos: number) => {
    if (node.marks) {
      const suggestionMark = node.marks.find(
        (mark: any) => mark.type.name === 'suggestion'
      );
      
      if (suggestionMark && suggestionMark.attrs.suggestedText) {
        changes.push({
          from: pos,
          to: pos + node.nodeSize,
          suggestedText: suggestionMark.attrs.suggestedText
        });
      }
    }
  });

  // Apply changes in reverse order to maintain position accuracy
  changes.reverse().forEach(change => {
    editor.chain()
      .focus()
      .setTextSelection({ from: change.from, to: change.to })
      .unsetMark('suggestion')
      .insertContent(change.suggestedText)
      .run();
  });

  console.log(`Accepted ${changes.length} suggestions`);
  return changes.length;
};

// Remove all formatting, keep only plain text
export const removeAllFormatting = (editor: any) => {
  if (!editor) return;

  // Get plain text content
  const plainText = editor.getText();
  
  // Clear all content and insert plain text
  editor.chain()
    .focus()
    .clearContent()
    .insertContent(plainText)
    .run();

  console.log('All formatting removed, text converted to plain format');
};

// Remove all marks but keep structure (paragraphs, lists, etc.)
export const removeAllMarks = (editor: any) => {
  if (!editor) return;

  editor.chain()
    .focus()
    .selectAll()
    .unsetAllMarks()
    .run();

  console.log('All text marks removed, structure preserved');
};

// Clean up specific AI-related marks
export const removeAIMarks = (editor: any) => {
  if (!editor) return;

  editor.chain()
    .focus()
    .selectAll()
    .unsetMark('suggestion')
    .unsetMark('addition')
    .unsetMark('deletion')
    .run();

  console.log('AI suggestion marks removed');
};

// Set all text to black color and remove text styling
export const setTextToBlack = (editor: any) => {
  if (!editor) return;

  editor.chain()
    .focus()
    .selectAll()
    .unsetMark('textStyle')
    .setColor('#000000')
    .run();

  console.log('All text set to black color');
};

// Comprehensive function to accept all changes and clean formatting
export const acceptAllChangesAndClean = (editor: any) => {
  if (!editor) return;

  console.log('Starting comprehensive cleanup...');

  // Step 1: Accept all AI suggestions
  const acceptedCount = acceptAllSuggestions(editor);

  // Step 2: Remove all marks (colors, styles, etc.)
  removeAllMarks(editor);

  // Step 3: Ensure text is black
  setTextToBlack(editor);

  // Step 4: Remove any remaining AI-specific marks
  removeAIMarks(editor);

  console.log('All changes accepted and formatting cleaned');
  return acceptedCount;
};

// Function to get clean HTML without marks
export const getCleanHTML = (editor: any): string => {
  if (!editor) return '';

  // Get HTML but strip out mark-related attributes
  let html = editor.getHTML();
  
  // Remove suggestion-related attributes and spans
  html = html.replace(/<span[^>]*data-suggestion[^>]*>/g, '');
  html = html.replace(/<\/span>/g, '');
  html = html.replace(/style="[^"]*"/g, '');
  html = html.replace(/class="[^"]*suggestion[^"]*"/g, '');
  html = html.replace(/data-[^=]*="[^"]*"/g, '');
  
  return html;
};

// Function to get completely plain text
export const getPlainText = (editor: any): string => {
  if (!editor) return '';
  return editor.getText();
};

// Check if user has admin/publisher permissions
export const canAcceptChanges = (userRole: string): boolean => {
  return ['admin', 'publisher', 'super-admin', 'publish'].includes(userRole.toLowerCase());
};

// Reject all suggestions (remove marks but keep original text)
export const rejectAllSuggestions = (editor: any) => {
  if (!editor) return;

  const { state } = editor;
  const { doc } = state;
  let rejectedCount = 0;

  // Count suggestions before removing them
  doc.descendants((node: any) => {
    if (node.marks) {
      const suggestionMark = node.marks.find(
        (mark: any) => mark.type.name === 'suggestion'
      );
      if (suggestionMark) {
        rejectedCount++;
      }
    }
  });

  editor.chain()
    .focus()
    .selectAll()
    .unsetMark('suggestion')
    .unsetMark('addition')
    .unsetMark('deletion')
    .run();

  console.log(`Rejected ${rejectedCount} suggestions and marks removed`);
  return rejectedCount;
};
