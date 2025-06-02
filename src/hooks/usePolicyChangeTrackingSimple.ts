
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { generateChangeId, getUserInitials } from '@/utils/trackingUtils';

interface PolicyChange {
  id: string;
  policy_id: string;
  user_id: string;
  user_name: string;
  user_initials: string;
  user_color: string;
  change_type: 'insert' | 'delete' | 'modify' | 'format';
  content_before: string | null;
  content_after: string | null;
  position_start: number;
  position_end: number;
  field_name: string;
  timestamp: string;
  is_accepted: boolean;
  accepted_by: string | null;
  accepted_at: string | null;
  session_id: string;
  metadata: Record<string, any>;
}

interface UsePolicyChangeTrackingProps {
  policyId: string;
  fieldName: string;
}

export function usePolicyChangeTracking({ policyId, fieldName }: UsePolicyChangeTrackingProps) {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [changes, setChanges] = useState<PolicyChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateChangeId());

  // Generate user color based on user ID
  const getUserColor = useCallback((userId: string) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, []);

  // Record a new change - for now just log it since table might not be ready
  const recordChange = useCallback(async (changeData: {
    changeType: 'insert' | 'delete' | 'modify' | 'format';
    contentBefore?: string;
    contentAfter?: string;
    positionStart: number;
    positionEnd: number;
    metadata?: Record<string, any>;
  }) => {
    if (!currentUser) return;

    try {
      // Get user name from currentUser, using email as fallback
      const userName = (currentUser as any).name || currentUser.email;
      const userInitials = getUserInitials(userName, currentUser.email);
      const userColor = getUserColor(currentUser.id);

      // For now, just log the change since the table might not be fully set up
      console.log('Recording change:', {
        policyId,
        userId: currentUser.id,
        userName,
        userInitials,
        userColor,
        changeType: changeData.changeType,
        contentBefore: changeData.contentBefore,
        contentAfter: changeData.contentAfter,
        positionStart: changeData.positionStart,
        positionEnd: changeData.positionEnd,
        fieldName,
        sessionId,
        metadata: changeData.metadata || {}
      });

      // Create a mock change for the UI
      const mockChange: PolicyChange = {
        id: generateChangeId(),
        policy_id: policyId,
        user_id: currentUser.id,
        user_name: userName,
        user_initials: userInitials,
        user_color: userColor,
        change_type: changeData.changeType,
        content_before: changeData.contentBefore || null,
        content_after: changeData.contentAfter || null,
        position_start: changeData.positionStart,
        position_end: changeData.positionEnd,
        field_name: fieldName,
        timestamp: new Date().toISOString(),
        is_accepted: false,
        accepted_by: null,
        accepted_at: null,
        session_id: sessionId,
        metadata: changeData.metadata || {}
      };

      setChanges(prev => [...prev, mockChange]);

    } catch (error) {
      console.error('Error recording change:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record change.",
      });
    }
  }, [currentUser, policyId, fieldName, sessionId, getUserColor, toast]);

  // Load changes - for now return empty array
  const loadChanges = useCallback(async () => {
    setIsLoading(true);
    try {
      // For now, don't load anything since table might not be ready
      console.log('Loading changes for policy:', policyId, 'field:', fieldName);
      setChanges([]);
    } catch (error) {
      console.error('Error loading changes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [policyId, fieldName]);

  // Accept/reject a change
  const updateChangeStatus = useCallback(async (changeId: string, isAccepted: boolean) => {
    if (!currentUser) return;

    try {
      console.log('Updating change status:', changeId, isAccepted);
      
      // Update local state
      setChanges(prev => prev.map(change => 
        change.id === changeId 
          ? { 
              ...change, 
              is_accepted: isAccepted,
              accepted_by: currentUser.id,
              accepted_at: new Date().toISOString()
            }
          : change
      ));

      toast({
        title: "Success",
        description: `Change ${isAccepted ? 'accepted' : 'rejected'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating change status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update change status.",
      });
    }
  }, [currentUser, toast]);

  const canReviewChanges = userRole === 'publish' || userRole === 'super-admin';

  return {
    changes,
    isLoading,
    recordChange,
    loadChanges,
    updateChangeStatus,
    canReviewChanges,
    sessionId
  };
}
