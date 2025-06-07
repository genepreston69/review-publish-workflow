import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIWritingAssistantProps {
  onTextGenerated: (text: string) => void;
  context?: string;
  placeholder?: string;
}

export function AIWritingAssistant({ 
  onTextGenerated, 
  context = '', 
  placeholder = 'Describe what you want to write about...' 
}: AIWritingAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { userRole } = useAuth();
  const { toast } = useToast();

  // Only allow AI assistance for editors, publishers, and admins
  const canUseAI = userRole === 'edit' || userRole === 'publish' || userRole === 'admin';

  const generateText = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt for text generation.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: prompt.trim(),
          context: context 
        }
      });

      if (error) throw error;

      if (data?.content) {
        setGeneratedText(data.content);
        toast({
          title: "Success",
          description: "Content generated successfully!",
        });
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate content. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canUseAI) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Writing Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>AI assistance is available for editors, publishers, and admins only.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          AI Writing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className="mb-4"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={generateText}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>
        {generatedText && (
          <div className="mt-4">
            <Textarea
              value={generatedText}
              readOnly
              className="border border-gray-300 rounded-md p-2"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(generatedText);
                setCopied(true);
              }}
            >
              {copied ? (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
