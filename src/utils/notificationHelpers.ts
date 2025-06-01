
import { supabase } from '@/integrations/supabase/client';
import { notificationService, NotificationData } from '@/services/notificationService';

export interface NotifyPolicyStatusChangeParams {
  policyId: string;
  policyName: string;
  oldStatus?: string;
  newStatus: string;
  creatorId?: string;
  reviewerId?: string;
  reviewerComment?: string;
  publisherId?: string;
}

export const notifyPolicyStatusChange = async (params: NotifyPolicyStatusChangeParams) => {
  const {
    policyId,
    policyName,
    oldStatus,
    newStatus,
    creatorId,
    reviewerId,
    reviewerComment,
    publisherId
  } = params;

  try {
    // Get user profiles for email notifications
    const userIds = [creatorId, reviewerId, publisherId].filter(Boolean);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, name')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Determine notification type and recipients
    let notificationType: string;
    let recipients: string[] = [];

    switch (newStatus) {
      case 'under-review':
        notificationType = 'policy_assignment';
        if (reviewerId) recipients.push(reviewerId);
        break;
      case 'published':
        notificationType = 'policy_published';
        if (creatorId) recipients.push(creatorId);
        break;
      case 'awaiting-changes':
        notificationType = 'policy_returned';
        if (creatorId) recipients.push(creatorId);
        break;
      default:
        notificationType = 'policy_status_change';
        if (creatorId) recipients.push(creatorId);
        if (reviewerId && reviewerId !== creatorId) recipients.push(reviewerId);
    }

    // Create notifications for each recipient
    for (const userId of recipients) {
      const profile = profileMap.get(userId);
      if (!profile) continue;

      let title: string;
      let message: string;

      switch (notificationType) {
        case 'policy_assignment':
          title = `New Policy Assignment: ${policyName}`;
          message = `You have been assigned to review the policy "${policyName}".`;
          break;
        case 'policy_published':
          title = `Policy Published: ${policyName}`;
          message = `Your policy "${policyName}" has been published and is now live.`;
          break;
        case 'policy_returned':
          title = `Policy Returned: ${policyName}`;
          message = `Your policy "${policyName}" requires changes before publication.`;
          break;
        default:
          title = `Policy Status Updated: ${policyName}`;
          message = `The policy "${policyName}" status has changed from ${oldStatus || 'draft'} to ${newStatus}.`;
      }

      const metadata: NotificationData = {
        policyId,
        policyName,
        oldStatus,
        newStatus,
        reviewerComment,
        userName: profile.name,
      };

      await notificationService.createNotification({
        userId,
        type: notificationType as any,
        title,
        message,
        metadata,
        sendEmail: true,
        userEmail: profile.email,
      });
    }
  } catch (error) {
    console.error('Error sending policy status notifications:', error);
  }
};

export const notifyPolicyComment = async (
  policyId: string,
  policyName: string,
  creatorId: string,
  reviewerComment: string
) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', creatorId)
      .single();

    if (!profile) return;

    const metadata: NotificationData = {
      policyId,
      policyName,
      reviewerComment,
      userName: profile.name,
    };

    await notificationService.createNotification({
      userId: creatorId,
      type: 'policy_comment',
      title: `Comment Added: ${policyName}`,
      message: `A reviewer has added a comment to your policy "${policyName}".`,
      metadata,
      sendEmail: true,
      userEmail: profile.email,
    });
  } catch (error) {
    console.error('Error sending policy comment notification:', error);
  }
};
