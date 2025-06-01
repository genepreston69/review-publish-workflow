
import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  policyId: string;
  policyName: string;
  oldStatus?: string;
  newStatus?: string;
  reviewerComment?: string;
  assignedBy?: string;
  userName?: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: 'policy_status_change' | 'policy_assignment' | 'policy_comment' | 'policy_published' | 'policy_returned';
  title: string;
  message: string;
  metadata: Record<string, any>;
  sendEmail?: boolean;
  userEmail?: string;
}

class NotificationService {
  async createNotification(params: CreateNotificationParams) {
    try {
      // Create in-app notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          metadata: params.metadata,
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        return;
      }

      // Send email notification if requested and user email is provided
      if (params.sendEmail && params.userEmail) {
        await this.sendEmailNotification(params.userEmail, params.type, params.metadata);
      }
    } catch (error) {
      console.error('Error in createNotification:', error);
    }
  }

  async sendEmailNotification(email: string, type: string, data: NotificationData) {
    try {
      const { error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: email,
          type,
          data,
        },
      });

      if (error) {
        console.error('Error sending email notification:', error);
      }
    } catch (error) {
      console.error('Error in sendEmailNotification:', error);
    }
  }

  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      }
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  }
}

export const notificationService = new NotificationService();
