
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Policy } from './types';
import { PolicyCardListView } from './PolicyCardListView';
import { PolicyCardGridView } from './PolicyCardGridView';
import { useInfiniteLoopProtection } from '@/hooks/useInfiniteLoopProtection';

interface PolicyCardProps {
  policy: Policy;
  canPublish: boolean;
  isEditing: boolean;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onEdit?: (policyId: string) => void;
  onView?: (policyId: string) => void;
  onDelete?: (policyId: string) => void;
  onArchive?: (policyId: string) => void;
  compact?: boolean;
  listView?: boolean;
}

export function PolicyCard({
  policy,
  canPublish,
  isEditing,
  onUpdateStatus,
  onEdit,
  onView,
  onDelete,
  onArchive,
  compact = false,
  listView = false,
}: PolicyCardProps) {
  // Add infinite loop protection
  useInfiniteLoopProtection({
    componentName: `PolicyCard-${policy.id}`,
    maxRenders: 20
  });

  const { currentUser } = useAuth();
  const { userRole } = useUserRole();

  const canEdit = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';
  const canDelete = userRole === 'super-admin';
  const canArchive = userRole === 'super-admin' || userRole === 'publish';
  const isSuperAdmin = userRole === 'super-admin';
  const isCreator = policy.creator_id === currentUser?.id;

  // Read-only users can view published policies
  const canViewPolicy = userRole === 'read-only' ? policy.status === 'published' : true;

  // Super admins can publish any policy regardless of status or creator
  const canPublishPolicy = isSuperAdmin || (
    (canPublish || userRole === 'publish') && 
    (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'awaiting-changes') &&
    !isCreator
  );

  // Super admins can edit any policy, others follow existing rules
  const showEdit = onEdit && (
    isSuperAdmin || 
    (canEdit && (
      (policy.status === 'draft' || policy.status === 'awaiting-changes') ||
      canPublish
    ))
  );

  // Super admins can submit any draft policy, others follow existing rules
  const showSubmit = (policy.status === 'draft') && (isSuperAdmin || canEdit || isCreator);

  // Show view button for all users who can view the policy
  const showView = onView && canViewPolicy;

  if (listView) {
    return (
      <PolicyCardListView
        policy={policy}
        showEdit={showEdit}
        showSubmit={showSubmit}
        showView={showView}
        canPublishPolicy={canPublishPolicy}
        canArchive={canArchive}
        canDelete={canDelete}
        onUpdateStatus={onUpdateStatus}
        onEdit={onEdit}
        onView={onView}
        onDelete={onDelete}
        onArchive={onArchive}
      />
    );
  }

  return (
    <PolicyCardGridView
      policy={policy}
      compact={compact}
      canPublish={canPublish}
      showEdit={showEdit}
      showSubmit={showSubmit}
      showView={showView}
      canPublishPolicy={canPublishPolicy}
      canArchive={canArchive}
      canDelete={canDelete}
      onUpdateStatus={onUpdateStatus}
      onEdit={onEdit}
      onView={onView}
      onDelete={onDelete}
      onArchive={onArchive}
    />
  );
}
