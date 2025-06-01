
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePolicyNumberGeneration(policyType: string) {
  const [generatedPolicyNumber, setGeneratedPolicyNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const generatePolicyNumber = async () => {
      console.log('=== POLICY NUMBER GENERATION START ===');
      console.log('Policy type:', policyType);
      
      // Reset state
      setError(null);
      setGeneratedPolicyNumber('');
      
      if (!policyType || policyType.trim() === '') {
        console.log('=== NO POLICY TYPE PROVIDED ===');
        setGeneratedPolicyNumber('');
        return;
      }

      // Validate policy type (basic validation)
      if (policyType.length < 2) {
        console.log('=== INVALID POLICY TYPE (too short) ===');
        setError('Policy type must be at least 2 characters long');
        return;
      }

      setIsLoading(true);
      
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`=== ATTEMPT ${attempts}/${maxAttempts} ===`);
        
        try {
          console.log('Calling generate_next_policy_number RPC with:', { p_policy_type: policyType });
          
          const { data, error: rpcError } = await supabase
            .rpc('generate_next_policy_number', { p_policy_type: policyType });

          console.log('=== RPC RESPONSE ===');
          console.log('Data:', data);
          console.log('Error:', rpcError);

          if (rpcError) {
            console.error(`=== RPC ERROR (attempt ${attempts}) ===`, rpcError);
            
            if (attempts === maxAttempts) {
              const errorMessage = `Failed to generate policy number: ${rpcError.message}`;
              setError(errorMessage);
              toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
              });
              return;
            }
            
            // Wait before retry (exponential backoff)
            const delay = Math.pow(2, attempts - 1) * 1000; // 1s, 2s, 4s
            console.log(`=== RETRYING IN ${delay}ms ===`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          if (!data) {
            console.error(`=== NO DATA RETURNED (attempt ${attempts}) ===`);
            
            if (attempts === maxAttempts) {
              const errorMessage = 'Policy number generation returned no data';
              setError(errorMessage);
              toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
              });
              return;
            }
            
            // Wait before retry
            const delay = Math.pow(2, attempts - 1) * 1000;
            console.log(`=== RETRYING IN ${delay}ms ===`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          // Success!
          console.log('=== POLICY NUMBER GENERATED SUCCESSFULLY ===', data);
          setGeneratedPolicyNumber(data);
          setError(null);
          return;

        } catch (error) {
          console.error(`=== UNEXPECTED ERROR (attempt ${attempts}) ===`, error);
          
          if (attempts === maxAttempts) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while generating policy number';
            setError(errorMessage);
            toast({
              variant: "destructive",
              title: "Error",
              description: errorMessage,
            });
            return;
          }
          
          // Wait before retry
          const delay = Math.pow(2, attempts - 1) * 1000;
          console.log(`=== RETRYING IN ${delay}ms ===`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    generatePolicyNumber().finally(() => {
      setIsLoading(false);
      console.log('=== POLICY NUMBER GENERATION END ===');
    });
  }, [policyType, toast]);

  return {
    generatedPolicyNumber,
    isLoading,
    error,
  };
}
