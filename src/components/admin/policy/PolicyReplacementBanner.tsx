
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink } from 'lucide-react';
import { stripHtml } from './policyUtils';

interface PolicyReplacementBannerProps {
  policyId: string;
  onViewReplacement?: (policyId: string) => void;
}

interface ReplacementPolicy {
  id: string;
  name: string;
  policy_number: string;
  published_at: string;
}

export function PolicyReplacementBanner({ policyId, onViewReplacement }: PolicyReplacementBannerProps) {
  const [replacementPolicy, setReplacementPolicy] = useState<ReplacementPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const findReplacementPolicy = async () => {
      try {
        console.log('=== FINDING REPLACEMENT POLICY ===', policyId);
        
        // First get the policy to find its policy_number and parent_policy_id
        const { data: currentPolicy, error: currentError } = await supabase
          .from('Policies')
          .select('policy_number, parent_policy_id, archived_at')
          .eq('id', policyId)
          .single();

        if (currentError || !currentPolicy?.archived_at) {
          setIsLoading(false);
          return;
        }

        const policyNumber = currentPolicy.policy_number;
        if (!policyNumber) {
          setIsLoading(false);
          return;
        }

        // Find the published policy with the same policy number that was published after this policy was archived
        const { data: replacement, error: replacementError } = await supabase
          .from('Policies')
          .select('id, name, policy_number, published_at')
          .eq('policy_number', policyNumber)
          .eq('status', 'published')
          .gt('published_at', currentPolicy.archived_at)
          .order('published_at', { ascending: true })
          .limit(1)
          .single();

        if (replacementError || !replacement) {
          console.log('No replacement policy found');
          setIsLoading(false);
          return;
        }

        console.log('=== REPLACEMENT POLICY FOUND ===', replacement);
        setReplacementPolicy(replacement);
      } catch (error) {
        console.error('Error finding replacement policy:', error);
      } finally {
        setIsLoading(false);
      }
    };

    findReplacementPolicy();
  }, [policyId]);

  if (isLoading || !replacementPolicy) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <span>
            This policy was replaced by <strong>"{stripHtml(replacementPolicy.name)}"</strong> on {formatDate(replacementPolicy.published_at)}
          </span>
          {onViewReplacement && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewReplacement(replacementPolicy.id)}
              className="ml-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Current Policy
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
