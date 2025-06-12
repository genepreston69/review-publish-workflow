
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, Loader2 } from 'lucide-react';
import { handleAIImprovement, type AIOperation, getAIOperationDisplayName } from './aiSuggestionHandler';
import { useToast } from '@/hooks/use-toast';

interface AIToolbarProps {
  editor: any;
  userInitials: string;
  context?: string;
  onAISuggestion?: (changeId: string, operation: string, originalText: string, suggestedText: string) => void;
}

const AI_OPERATIONS: AIOperation[] = [
  'improve-writing',
  'grammar-check',
  'tone-formal',
  'tone-casual',
  'policy-language'
];

export function AIToolbar({ editor, userInitials, context, onAISuggestion }: AIToolbarProps) {
  const [processingOperation, setProcessingOperation] = useState<AIOperation | null>(null);
  const { toast } = useToast();

  const handleAIOperation = async (operation: AIOperation) => {
    if (!editor || processingOperation) return;

    const { from, to } = editor.state.selection;
    
    if (from === to) {
      toast({
        variant: "destructive",
        title: "No text selected",
        description: "Please select some text to use AI suggestions.",
      });
      return;
    }

    const selectedText = editor.state.doc.textBetween(from, to);
    
    setProcessingOperation(operation);
    
    try {
      const changeId = await handleAIImprovement(editor, operation, userInitials, context);
      
      if (changeId && onAISuggestion) {
        // This would need to be implemented to get the suggested text
        // For now, we'll just notify that a suggestion was made
        onAISuggestion(changeId, operation, selectedText, 'AI-suggested text');
      }
      
      toast({
        title: "AI Suggestion Added",
        description: `${getAIOperationDisplayName(operation)} suggestion has been added as a tracked change.`,
      });
    } catch (error) {
      console.error('Error with AI operation:', error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to get AI suggestion. Please try again.",
      });
    } finally {
      setProcessingOperation(null);
    }
  };

  const hasSelection = editor && !editor.state.selection.empty;

  return (
    <div className="border-b border-gray-200 p-3 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="flex items-center gap-2 mb-2">
        <Wand2 className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-800">AI Writing Assistant</span>
        <Badge variant="secondary" className="text-xs">
          {hasSelection ? 'Text Selected' : 'Select text first'}
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {AI_OPERATIONS.map((operation) => (
          <Button
            key={operation}
            size="sm"
            variant="outline"
            onClick={() => handleAIOperation(operation)}
            disabled={!hasSelection || processingOperation !== null}
            className="text-xs h-7 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {processingOperation === operation ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              getAIOperationDisplayName(operation)
            )}
          </Button>
        ))}
      </div>
      
      {!hasSelection && (
        <div className="mt-2 text-xs text-gray-500">
          Select text in the editor above to use AI writing tools
        </div>
      )}
    </div>
  );
}
