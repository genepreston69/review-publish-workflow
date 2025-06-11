
import { useAuth } from '@/hooks/useAuth';
import { Policy } from './types';
import { PolicyCardListView } from './PolicyCardListView';
import { PolicyCardGridView } from './PolicyCardGridView';

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
  const { currentUser, userRole } = useAuth();

  const canEdit = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';
  const canDelete = userRole === 'super-admin';
  const canArchive = userRole === 'super-admin' || userRole === 'publish';
  const isSuperAdmin = userRole === 'super-admin';
  const isPublisher = userRole === 'publish';
  const isCreator = policy.creator_id === currentUser?.id;

  // Publishers and super admins can publish any policy, editors follow maker/checker rules
  const canPublishPolicy = isSuperAdmin || isPublisher || (
    canPublish && 
    (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'awaiting-changes') &&
    !isCreator
  );

  // Publishers and super admins can edit any policy, others follow existing rules
  const showEdit = onEdit && (
    isSuperAdmin || 
    isPublisher ||
    (canEdit && (
      (policy.status === 'draft' || policy.status === 'awaiting-changes') ||
      canPublish
    ))
  );

  // Publishers and super admins can submit any draft policy, others follow existing rules
  const showSubmit = (policy.status === 'draft') && (isSuperAdmin || isPublisher || canEdit || isCreator);

  if (listView) {
    return (
      <PolicyCardListView
        policy={policy}
        showEdit={showEdit}
        showSubmit={showSubmit}
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
