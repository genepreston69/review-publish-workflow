
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarContent, AvatarFallback } from '@/components/ui/avatar';
import { Trash2, Edit3, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatDate';

interface PolicyComment {
  id: string;
  policy_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    initials: string;
  };
}

interface PolicyCommentSectionProps {
  policyId: string;
}

export function PolicyCommentSection({ policyId }: PolicyCommentSectionProps) {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<PolicyComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const isSuperAdmin = userRole === 'super-admin';

  useEffect(() => {
    fetchComments();
  }, [policyId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('policy_comments')
        .select(`
          *,
          user:user_id(id, name, email, initials)
        `)
        .eq('policy_id', policyId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load comments.",
        });
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading comments.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('policy_comments')
        .insert({
          policy_id: policyId,
          user_id: currentUser.id,
          comment_text: newComment.trim(),
        });

      if (error) {
        console.error('Error adding comment:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add comment.",
        });
        return;
      }

      setNewComment('');
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });

      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while adding the comment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingText(currentText);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingText.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from('policy_comments')
        .update({ comment_text: editingText.trim() })
        .eq('id', commentId);

      if (error) {
        console.error('Error updating comment:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update comment.",
        });
        return;
      }

      setEditingCommentId(null);
      setEditingText('');
      toast({
        title: "Success",
        description: "Comment updated successfully.",
      });

      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating the comment.",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('policy_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete comment.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });

      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting the comment.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Policy Discussion
          <span className="text-sm text-gray-500 font-normal">
            ({comments.length} {comments.length === 1 ? 'comment' : 'comments'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new comment form */}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or note about this policy..."
            className="min-h-[80px]"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>
        </form>

        {/* Comments list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to add a note about this policy.
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {comment.user.initials || 'UN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.user.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                          {comment.updated_at !== comment.created_at && ' (edited)'}
                        </span>
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(comment.id)}
                              disabled={!editingText.trim()}
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.comment_text}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {editingCommentId !== comment.id && (
                    <div className="flex gap-1">
                      {/* Users can edit their own comments */}
                      {comment.user_id === currentUser.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditComment(comment.id, comment.comment_text)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {/* Users can delete their own comments, super-admins can delete any */}
                      {(comment.user_id === currentUser.id || isSuperAdmin) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
