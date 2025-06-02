
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
