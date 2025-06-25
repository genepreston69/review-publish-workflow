
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Policy, toPolicyType } from './types';

interface PolicyVersionHistoryProps {
  policyId: string;
  onViewVersion: (versionId: string) => void;
}

export function PolicyVersionHistory({ policyId, onViewVersion }: PolicyVersionHistoryProps) {
  const [versions, setVersions] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadVersionHistory = async () => {
      try {
        setIsLoading(true);
        console.log('=== LOADING VERSION HISTORY ===', policyId);

        // First get the current policy to find its parent_policy_id
        const { data: currentPolicy, error: currentError } = await supabase
          .from('Policies')
          .select('parent_policy_id')
          .eq('id', policyId)
          .single();

        if (currentError) {
          console.error('Error loading current policy:', currentError);
          return;
        }

        // Use parent_policy_id if it exists, otherwise use current policy id
        const rootPolicyId = currentPolicy.parent_policy_id || policyId;

        // Get all versions (current policy + all with same parent_policy_id)
        const { data: versionsData, error: versionsError } = await supabase
          .from('Policies')
          .select(`
            *,
            creator:profiles!Policies_creator_id_fkey(id, name, email),
            publisher:profiles!Policies_publisher_id_fkey(id, name, email)
          `)
          .or(`id.eq.${rootPolicyId},parent_policy_id.eq.${rootPolicyId}`)
          .order('created_at', { ascending: false });

        if (versionsError) {
          console.error('Error loading versions:', versionsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load version history.",
          });
          return;
        }

        // Convert to typed policies
        const typedVersions = (versionsData || []).map(toPolicyType);
        setVersions(typedVersions);
        
        console.log('=== VERSION HISTORY LOADED ===', typedVersions.length, 'versions');
      } catch (error) {
        console.error('Error loading version history:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load version history.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (policyId) {
      loadVersionHistory();
    }
  }, [policyId, toast]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (versions.length <= 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            No previous versions available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Version History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {versions.map((version, index) => (
          <div key={version.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {index === 0 ? 'Current Version' : `Version ${versions.length - index}`}
                  </span>
                  <Badge variant={version.status === 'published' ? 'default' : 'secondary'}>
                    {version.status || 'draft'}
                  </Badge>
                  {version.id === policyId && (
                    <Badge variant="outline">Viewing</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(version.created_at).toLocaleDateString()}
                  </div>
                  {version.creator && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {version.creator.name}
                    </div>
                  )}
                </div>
              </div>
              
              {version.id !== policyId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewVersion(version.id)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              )}
            </div>
            
            {version.name && (
              <div className="text-sm">
                <span className="font-medium">Title:</span> {version.name}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
