
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Wand2, 
  CheckCircle, 
  FileText, 
  Expand, 
  Users, 
  User, 
  Gavel,
  Loader2,
  Lock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AISuggestionDialog } from './ai-suggestion-dialog';

interface AIWritingAssistantProps {
  text: string;
  onChange: (text: string) => void;
  context?: string;
  className?: string;
}

interface PendingSuggestion {
  originalText: string;
  suggestedText: string;
  operationName: string;
  operationDescription: string;
}

export function AIWritingAssistant({ text, onChange, context, className }: AIWritingAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState<string | null>(null);
  const [pendingSuggestion, setPendingSuggestion] = useState<PendingSuggestion | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, userRole, isLoading: authLoading } = useAuth();

  // Check if user has edit permissions
  const hasEditAccess = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  const callAIAssistant = async (operation: string, operationName: string, operationDescription: string) => {
    // Check authentication first
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to use AI assistance features.",
      });
      return;
    }

    // Check edit permissions
    if (!hasEditAccess) {
      toast({
        variant: "destructive",
        title: "Insufficient Permissions",
        description: "You need edit access to use AI assistance features.",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "No text to process",
        description: "Please enter some text before using AI assistance.",
      });
      return;
    }

    setIsLoading(true);
    setLoadingOperation(operation);

    try {
      console.log(`AI Writing Assistant - ${operationName} started`);
      
      const { data, error } = await supabase.functions.invoke('ai-writing-assistant', {
        body: { text, operation, context }
      });

      if (error) {
        console.error('AI Writing Assistant error:', error);
        throw error;
      }

      if (data?.improvedText) {
        // Store suggestion for user review
        setPendingSuggestion({
          originalText: text,
          suggestedText: data.improvedText,
          operationName,
          operationDescription
        });
        setDialogOpen(true);
        console.log(`AI Writing Assistant - ${operationName} completed, awaiting user decision`);
      } else {
        throw new Error('No improved text received');
      }
    } catch (error) {
      console.error(`AI Writing Assistant - ${operationName} error:`, error);
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

  const handleAcceptSuggestion = () => {
    if (pendingSuggestion) {
      console.log('AI Suggestion - Applying changes:', {
        operation: pendingSuggestion.operationName,
        originalLength: pendingSuggestion.originalText.length,
        newLength: pendingSuggestion.suggestedText.length
      });
      
      onChange(pendingSuggestion.suggestedText);
      
      toast({
        title: "AI Suggestion Accepted",
        description: `${pendingSuggestion.operationName} applied successfully.`,
      });
      setPendingSuggestion(null);
    }
  };

  const handleRejectSuggestion = () => {
    if (pendingSuggestion) {
      console.log('AI Suggestion - Rejected:', pendingSuggestion.operationName);
      
      toast({
        title: "AI Suggestion Rejected",
        description: `${pendingSuggestion.operationName} suggestion discarded.`,
        variant: "destructive",
      });
      setPendingSuggestion(null);
    }
  };

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

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={className}
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Show locked state if no authentication or insufficient permissions
  if (!user || !hasEditAccess) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={className}
        title={!user ? "Sign in required" : "Edit access required"}
      >
        <Lock className="w-4 h-4 mr-2" />
        AI Assistant
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            className={className}
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
                AI Assistant
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
                onClick={() => callAIAssistant(operation.key, operation.label, operation.description)}
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
                onClick={() => callAIAssistant(operation.key, operation.label, operation.description)}
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

      {pendingSuggestion && (
        <AISuggestionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          originalText={pendingSuggestion.originalText}
          suggestedText={pendingSuggestion.suggestedText}
          operationName={pendingSuggestion.operationName}
          operationDescription={pendingSuggestion.operationDescription}
          onAccept={handleAcceptSuggestion}
          onReject={handleRejectSuggestion}
        />
      )}
    </>
  );
}
