
import React, { useState, useEffect } from 'react';
import { createTwoFilesPatch, diffWords } from 'diff';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PolicyRevision } from './types';

interface DiffEditorProps {
  policyId: string;
  fieldName: string;
  originalContent: string;
  currentContent: string;
  onRevisionsUpdated?: () => void;
}

export function DiffEditor({ 
  policyId, 
  fieldName, 
  originalContent, 
  currentContent,
  onRevisionsUpdated 
}: DiffEditorProps) {
  const [revisions, setRevisions] = useState<PolicyRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSideBySide, setShowSideBySide] = useState(false);
  const { toast } = useToast();
  const { currentUser, userRole } = useAuth();

  const canReview = userRole === 'publish' || userRole === 'super-admin';

  useEffect(() => {
    loadRevisions();
  }, [policyId, fieldName]);

  const loadRevisions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('policy_revisions')
        .select(`
          *,
          created_by_profile:created_by(id, name, email),
          reviewed_by_profile:reviewed_by(id, name, email)
        `)
        .eq('policy_id', policyId)
        .eq('field_name', fieldName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading revisions:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load revisions.",
        });
        return;
      }

      setRevisions(data || []);
    } catch (error) {
      console.error('Error loading revisions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load revisions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRevision = async () => {
    if (!currentUser || originalContent === currentContent) return;

    try {
      const diff = diffWords(originalContent, currentContent);
      let changeType: 'addition' | 'deletion' | 'modification' = 'modification';
      
      if (!originalContent || originalContent.trim() === '') {
        changeType = 'addition';
      } else if (!currentContent || currentContent.trim() === '') {
        changeType = 'deletion';
      }

      const { data: revisionNumber } = await supabase
        .rpc('get_next_revision_number', { p_policy_id: policyId });

      const { error } = await supabase
        .from('policy_revisions')
        .insert({
          policy_id: policyId,
          revision_number: revisionNumber,
          field_name: fieldName,
          original_content: originalContent,
          modified_content: currentContent,
          change_type: changeType,
          change_metadata: { diff_data: diff },
          created_by: currentUser.id,
        });

      if (error) {
        console.error('Error creating revision:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create revision.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Revision created successfully.",
      });

      await loadRevisions();
      if (onRevisionsUpdated) onRevisionsUpdated();
    } catch (error) {
      console.error('Error creating revision:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create revision.",
      });
    }
  };

  const updateRevisionStatus = async (revisionId: string, status: 'accepted' | 'rejected', comment?: string) => {
    if (!canReview) return;

    try {
      const { error } = await supabase
        .from('policy_revisions')
        .update({
          status,
          reviewed_by: currentUser?.id,
          reviewed_at: new Date().toISOString(),
          review_comment: comment || null,
        })
        .eq('id', revisionId);

      if (error) {
        console.error('Error updating revision status:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update revision status.",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Revision ${status} successfully.`,
      });

      await loadRevisions();
      if (onRevisionsUpdated) onRevisionsUpdated();
    } catch (error) {
      console.error('Error updating revision status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update revision status.",
      });
    }
  };

  const renderDiffContent = (original: string, modified: string) => {
    const diff = diffWords(original, modified);
    
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Changes:</div>
        <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
          {diff.map((part, index) => {
            const color = part.added ? 'bg-green-200 text-green-800' : 
                         part.removed ? 'bg-red-200 text-red-800' : '';
            
            return (
              <span key={index} className={color}>
                {part.value}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSideBySide = (original: string, modified: string) => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Original</div>
          <div className="p-4 bg-red-50 rounded-md whitespace-pre-wrap text-sm border">
            {original}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Modified</div>
          <div className="p-4 bg-green-50 rounded-md whitespace-pre-wrap text-sm border">
            {modified}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  const hasChanges = originalContent !== currentContent;
  const hasPendingRevisions = revisions.some(r => r.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Changes for {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSideBySide(!showSideBySide)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showSideBySide ? 'Inline View' : 'Side-by-Side'}
            </Button>
            {hasChanges && (
              <Button onClick={createRevision} size="sm">
                Create Revision
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasChanges && (
          <div>
            <div className="mb-3">
              <Badge variant={hasPendingRevisions ? "destructive" : "secondary"}>
                {hasPendingRevisions ? 'Has Pending Changes' : 'No Pending Changes'}
              </Badge>
            </div>
            
            {showSideBySide ? 
              renderSideBySide(originalContent, currentContent) :
              renderDiffContent(originalContent, currentContent)
            }
          </div>
        )}

        {revisions.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">
              Revision History ({revisions.length} revisions)
            </div>
            <div className="space-y-3">
              {revisions.map((revision) => (
                <div key={revision.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          Revision #{revision.revision_number}
                        </span>
                        <Badge 
                          variant={
                            revision.status === 'accepted' ? 'default' :
                            revision.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {revision.status}
                        </Badge>
                        <Badge variant="outline">{revision.change_type}</Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(revision.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {canReview && revision.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateRevisionStatus(revision.id, 'accepted')}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateRevisionStatus(revision.id, 'rejected', 'Changes not approved')}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>

                  {showSideBySide ? 
                    renderSideBySide(revision.original_content || '', revision.modified_content) :
                    renderDiffContent(revision.original_content || '', revision.modified_content)
                  }

                  {revision.review_comment && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                      <div className="text-sm font-medium text-yellow-800">Review Comment:</div>
                      <div className="text-sm text-yellow-700">{revision.review_comment}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasChanges && revisions.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No changes or revisions for this field.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
