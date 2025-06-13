
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Policy } from './types';
import { PolicyFormValidation } from './PolicyFormValidation';
import { PolicyCreationSuccess } from './PolicyCreationSuccess';
import { PolicyCreationForm } from './PolicyCreationForm';

interface CreatePolicyFormProps {
  onPolicyCreated: (policy: Policy) => void;
}

export function CreatePolicyForm({ onPolicyCreated }: CreatePolicyFormProps) {
  const { userRole } = useAuth();
  const [createdPolicyId, setCreatedPolicyId] = useState<string | null>(null);

  // Check if user has edit access
  const hasEditAccess = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  const handlePolicyCreated = (policy: Policy) => {
    console.log('=== SETTING CREATED POLICY ID ===', policy.id);
    setCreatedPolicyId(policy.id);
    onPolicyCreated(policy);
  };

  const handleStartOver = () => {
    console.log('=== STARTING OVER ===');
    setCreatedPolicyId(null);
  };

  // Show access denied component if user doesn't have permission
  if (!hasEditAccess) {
    return <PolicyFormValidation hasEditAccess={hasEditAccess} />;
  }

  console.log('=== RENDER STATE ===');
  console.log('Created Policy ID:', createdPolicyId);
  console.log('User Role:', userRole);
  console.log('Has Edit Access:', hasEditAccess);

  // If policy was created successfully, show success state with comment section
  if (createdPolicyId) {
    return (
      <PolicyCreationSuccess 
        policyId={createdPolicyId}
        onStartOver={handleStartOver}
      />
    );
  }

  // Show the creation form
  return (
    <PolicyCreationForm
      userRole={userRole || ''}
      hasEditAccess={hasEditAccess}
      onPolicyCreated={handlePolicyCreated}
    />
  );
}
