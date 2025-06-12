
import { getAISuggestion, showAISuggestionAsTrackChange } from '@/utils/aiSuggestionUtils';

export type AIOperation = 
  | 'improve-writing'
  | 'grammar-check' 
  | 'tone-formal'
  | 'tone-casual'
  | 'policy-language'
  | 'summarize'
  | 'expand-content';

export async function handleAIImprovement(
  editor: any, 
  operation: AIOperation,
  userInitials: string = 'AI',
  context?: string
) {
  if (!editor) return;

  const { from, to } = editor.state.selection;
  
  if (from === to) {
    console.warn('No text selected for AI improvement');
    return;
  }

  const selectedText = editor.state.doc.textBetween(from, to);
  
  if (!selectedText.trim()) {
    console.warn('Selected text is empty');
    return;
  }

  try {
    console.log('Getting AI suggestion for operation:', operation);
    const improvedText = await getAISuggestion(selectedText, operation, context);
    
    // Show as tracked change instead of directly replacing
    const changeId = showAISuggestionAsTrackChange(
      editor,
      selectedText,
      improvedText,
      userInitials,
      operation
    );
    
    console.log('AI suggestion added as tracked change:', changeId);
    return changeId;
  } catch (error) {
    console.error('Error getting AI suggestion:', error);
    throw error;
  }
}

export function getAIOperationDisplayName(operation: AIOperation): string {
  switch (operation) {
    case 'improve-writing':
      return 'Improve Writing';
    case 'grammar-check':
      return 'Grammar Check';
    case 'tone-formal':
      return 'Make Formal';
    case 'tone-casual':
      return 'Make Casual';
    case 'policy-language':
      return 'Policy Language';
    case 'summarize':
      return 'Summarize';
    case 'expand-content':
      return 'Expand Content';
    default:
      return operation;
  }
}
