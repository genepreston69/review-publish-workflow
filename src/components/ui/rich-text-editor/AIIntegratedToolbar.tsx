
import { Button } from '@/components/ui/button';
import { Editor } from '@tiptap/react';
import { 
  Wand2, 
  CheckCircle, 
  FileText, 
  Expand, 
  Users, 
  User, 
  Gavel,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { showAISuggestionAsTrackChange } from '@/utils/aiSuggestionUtils';
import { supabase } from '@/integrations/supabase/client';

interface AIIntegratedToolbarProps {
  editor: Editor | null;
  userInitials: string;
  onAISuggestion?: (changeId: string, operation: string, originalText: string, suggestedText: string) => void;
  context?: string;
}

export function AIIntegratedToolbar({ 
  editor, 
  userInitials, 
  onAISuggestion,
  context 
}: AIIntegratedToolbarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState<string | null>(null);
  const { toast } = useToast();

  const aiOperations = [
    {
      key: 'improve-writing',
      label: 'Improve Writing',
      description: 'Enhance clarity and flow',
      icon: Wand2,
    },
    {
      key: 'grammar-check',
      label: 'Grammar Check',
      description: 'Fix grammar and spelling',
      icon: CheckCircle,
    },
    {
      key: 'summarize',
      label: 'Summarize',
      description: 'Create a concise summary',
      icon: FileText,
    },
    {
      key: 'expand-content',
      label: 'Expand Content',
      description: 'Add more details',
      icon: Expand,
    },
    {
      key: 'tone-formal',
      label: 'Make Formal',
      description: 'Professional tone',
      icon: Users,
    },
    {
      key: 'tone-casual',
      label: 'Make Casual',
      description: 'Conversational tone',
      icon: User,
    },
    {
      key: 'policy-language',
      label: 'Policy Language',
      description: 'Convert to policy format',
      icon: Gavel,
    },
  ];

  const handleAIOperation = async (operation: string, operationName: string) => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    if (!selectedText.trim()) {
      toast({
        variant: "destructive",
        title: "No text selected",
        description: "Please select some text to apply AI assistance.",
      });
      return;
    }

    setIsLoading(true);
    setLoadingOperation(operation);

    try {
      const { data, error } = await supabase.functions.invoke('ai-writing-assistant', {
        body: { text: selectedText, operation, context }
      });

      if (error) throw error;

      if (data?.improvedText) {
        // Show as tracked change instead of direct replacement
        const changeId = showAISuggestionAsTrackChange(
          editor,
          selectedText,
          data.improvedText,
          userInitials,
          operationName
        );

        // Notify parent component about the AI suggestion
        if (onAISuggestion && changeId) {
          onAISuggestion(changeId, operationName, selectedText, data.improvedText);
        }

        toast({
          title: "AI Suggestion Created",
          description: `${operationName} suggestion added as tracked change. Review in the change panel.`,
        });
      }
    } catch (error) {
      console.error(`AI ${operationName} error:`, error);
      toast({
        variant: "destructive",
        title: "AI Assistance Failed",
        description: `Failed to ${operationName.toLowerCase()}. Please try again.`,
      });
    } finally {
      setIsLoading(false);
      setLoadingOperation(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {loadingOperation === 'improve-writing' && 'Improving...'}
              {loadingOperation === 'grammar-check' && 'Checking...'}
              {loadingOperation === 'summarize' && 'Summarizing...'}
              {loadingOperation === 'expand-content' && 'Expanding...'}
              {loadingOperation === 'tone-formal' && 'Formalizing...'}
              {loadingOperation === 'tone-casual' && 'Casualizing...'}
              {loadingOperation === 'policy-language' && 'Converting...'}
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              AI Assist
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {aiOperations.slice(0, 4).map((operation) => {
          const Icon = operation.icon;
          return (
            <DropdownMenuItem
              key={operation.key}
              onClick={() => handleAIOperation(operation.key, operation.label)}
              disabled={isLoading}
            >
              <Icon className="w-4 h-4 mr-2" />
              <div className="flex flex-col">
                <span className="font-medium">{operation.label}</span>
                <span className="text-xs text-muted-foreground">{operation.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        {aiOperations.slice(4).map((operation) => {
          const Icon = operation.icon;
          return (
            <DropdownMenuItem
              key={operation.key}
              onClick={() => handleAIOperation(operation.key, operation.label)}
              disabled={isLoading}
            >
              <Icon className="w-4 h-4 mr-2" />
              <div className="flex flex-col">
                <span className="font-medium">{operation.label}</span>
                <span className="text-xs text-muted-foreground">{operation.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
