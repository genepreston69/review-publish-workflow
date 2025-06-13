
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Trash2, Save, X } from 'lucide-react';
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
    name?: string;
    email: string;
    role?: string;
    initials?: string;
  };
}

interface PolicyCommentSectionProps {
  policyId: string;
}

export function PolicyCommentSection({ policyId }: PolicyCommentSectionProps) {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<PolicyComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Check if user can comment (edit access or higher)
  const canComment = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  useEffect(() => {
    loadComments();
  }, [policyId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      console.log('=== LOADING COMMENTS FOR POLICY ===', policyId);

      const { data, error } = await supabase
        .from('policy_comments')
        .select(`
          *,
          user:user_id(id, name, email, role, initials)
        `)
        .eq('policy_id', policyId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading comments:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load comments.",
        });
        return;
      }

      console.log('=== COMMENTS LOADED ===', data);
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load comments.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!currentUser || !canComment || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      console.log('=== SUBMITTING NEW COMMENT ===');

      const { error } = await supabase
        .from('policy_comments')
        .insert({
          policy_id: policyId,
          user_id: currentUser.id,
          comment_text: newComment.trim(),
        });

      if (error) {
        console.error('Error submitting comment:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Comment added successfully.",
      });

      setNewComment('');
      await loadComments(); // Reload comments
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      console.log('=== UPDATING COMMENT ===', commentId);

      const { error } = await supabase
        .from('policy_comments')
        .update({
          comment_text: editText.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId);

      if (error) {
        console.error('Error updating comment:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Comment updated successfully.",
      });

      setEditingComment(null);
      setEditText('');
      await loadComments(); // Reload comments
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update comment.",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      console.log('=== DELETING COMMENT ===', commentId);

      const { error } = await supabase
        .from('policy_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });

      await loadComments(); // Reload comments
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete comment.",
      });
    }
  };

  const startEdit = (comment: PolicyComment) => {
    setEditingComment(comment.id);
    setEditText(comment.comment_text);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const getUserInitials = (user: PolicyComment['user']) => {
    if (user.initials) return user.initials;
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'super-admin': return 'bg-red-100 text-red-800';
      case 'publish': return 'bg-blue-100 text-blue-800';
      case 'edit': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading comments...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add new comment section */}
      {canComment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Comment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Add your comment or notes about this policy..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Comment'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Discussion ({comments.length} {comments.length === 1 ? 'comment' : 'comments'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No comments yet.</p>
              {canComment && <p className="text-sm mt-1">Be the first to add a comment!</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(comment.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.user.name || comment.user.email}
                          </span>
                          {comment.user.role && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(comment.user.role)}`}
                            >
                              {comment.user.role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                          {comment.updated_at !== comment.created_at && (
                            <span className="ml-1">(edited)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    {(currentUser?.id === comment.user_id || userRole === 'super-admin') && (
                      <div className="flex items-center gap-1">
                        {editingComment === comment.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditComment(comment.id)}
                              disabled={!editText.trim()}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {currentUser?.id === comment.user_id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(comment)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Comment content */}
                  {editingComment === comment.id ? (
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[80px]"
                    />
                  ) : (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.comment_text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
