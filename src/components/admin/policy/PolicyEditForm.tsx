
import { Card } from '@/components/ui/card';
import { PolicyEditFormHeader } from './PolicyEditFormHeader';
import { PolicyEditFormContent } from './PolicyEditFormContent';
import { PolicyEditFormLoading } from './PolicyEditFormLoading';
import { PolicyEditFormNotFound } from './PolicyEditFormNotFound';
import { PolicyEditFormAccessDenied } from './PolicyEditFormAccessDenied';
import { usePolicyEditFormLogic } from './PolicyEditFormLogic';
import { Policy } from './types';
import { PolicyFormValues } from './PolicyFormSchema';

interface PolicyEditFormProps {
  policyId: string;
  onPolicyUpdated: (policy: Policy) => void;
  onCancel: () => void;
}

export function PolicyEditForm({ policyId, onPolicyUpdated, onCancel }: PolicyEditFormProps) {
  const {
    form,
    policy,
    isLoading,
    isSubmitting,
    hasEditAccess,
    onSubmit,
  } = usePolicyEditFormLogic({ policyId, onPolicyUpdated, onCancel });

  if (!hasEditAccess) {
    return <PolicyEditFormAccessDenied onCancel={onCancel} />;
  }

  if (isLoading) {
    return <PolicyEditFormLoading />;
  }

  if (!policy) {
    return <PolicyEditFormNotFound onCancel={onCancel} />;
  }

  const initialData: PolicyFormValues = {
    name: policy.name || '',
    policy_type: policy.policy_type || '',
    purpose: policy.purpose || '',
    procedure: policy.procedure || '',
    policy_text: policy.policy_text || '',
  };

  return (
    <Card>
      <PolicyEditFormHeader 
        policyNumber={policy.policy_number} 
        onCancel={onCancel} 
      />
      <PolicyEditFormContent 
        initialData={initialData}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        form={form}
        policyId={policyId}
        showChangeTracking={true}
      />
    </Card>
  );
}
