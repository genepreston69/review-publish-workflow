
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePolicyNumberGeneration(policyType: string) {
  const [generatedPolicyNumber, setGeneratedPolicyNumber] = useState<string>('');

  useEffect(() => {
    const generatePolicyNumber = async () => {
      if (!policyType) {
        setGeneratedPolicyNumber('');
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('generate_next_policy_number', { p_policy_type: policyType });

        if (error) {
          console.error('Error generating policy number:', error);
          setGeneratedPolicyNumber('');
        } else {
          setGeneratedPolicyNumber(data);
        }
      } catch (error) {
        console.error('Error generating policy number:', error);
        setGeneratedPolicyNumber('');
      }
    };

    generatePolicyNumber();
  }, [policyType]);

  return generatedPolicyNumber;
}
