
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePolicies } from './usePolicies';
import { Policy } from './types';

export function usePolicyEditorLogic() {
  const { currentUser, userRole } = useAuth();
  const { policies, isLoading, updatePolicyStatus, deletePolicy, fetchPolicies } = usePolicies();
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter policies for policy-makers (only their own drafts and rejected policies)
  const editorPolicies = policies.filter(policy => {
    return policy.creator_id === currentUser?.id && 
           (policy.status === 'draft' || 
            policy.status === 'rejected' || 
            policy.status === 'awaiting-changes');
  });

  const handleEditPolicy = (policyId: string) => {
    setEditingPolicyId(policyId);
    setViewingPolicyId(null);
    setShowCreateForm(false);
  };

  const handleViewPolicy = (policyId: string) => {
    setViewingPolicyId(policyId);
    setEditingPolicyId(null);
    setShowCreateForm(false);
  };

  const handlePolicyUpdated = (updatedPolicy: Policy) => {
    setEditingPolicyId(null);
    fetchPolicies();
  };

  const handleCancelEdit = () => {
    setEditingPolicyId(null);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  const handleCreateNew = () => {
    setShowCreateForm(true);
    setEditingPolicyId(null);
    setViewingPolicyId(null);
  };

  const handleUpdateStatus = async (policyId: string, newStatus: string) => {
    console.log('=== POLICY EDITOR UPDATE STATUS ===', { policyId, newStatus });
    try {
      await updatePolicyStatus(policyId, newStatus);
    } catch (error) {
      console.error('Error updating policy status:', error);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    console.log('=== POLICY EDITOR DELETE POLICY ===', policyId);
    await deletePolicy(policyId);
  };

  const handleRefresh = () => {
    console.log('=== POLICY EDITOR REFRESHING ===');
    fetchPolicies();
  };

  const handlePolicyCreated = () => {
    setShowCreateForm(false);
    fetchPolicies();
  };

  const handleBackToList = () => {
    setShowCreateForm(false);
  };

  return {
    // State
    editorPolicies,
    isLoading,
    editingPolicyId,
    viewingPolicyId,
    showCreateForm,
    userRole,
    
    // Handlers
    handleEditPolicy,
    handleViewPolicy,
    handlePolicyUpdated,
    handleCancelEdit,
    handleCloseView,
    handleCreateNew,
    handleUpdateStatus,
    handleDeletePolicy,
    handleRefresh,
    handlePolicyCreated,
    handleBackToList,
    
    // Functions
    fetchPolicies
  };
}
