
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Eye, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Policy } from './types';

interface PolicyVersionHistoryProps {
  policyId: string;
  onViewVersion?: (versionId: string) => void;
}

export function PolicyVersionHistory({ policyId, onViewVersion }: PolicyVersionHistoryProps) {
  const [versions, setVersions] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [parentPolicyId, setParentPolicyId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadVersionHistory = async () => {
      try {
        setIsLoading(true);
        console.log('=== LOADING VERSION HISTORY ===', policyId);

        // First get the current policy to determine the parent
        const { data: currentPolicy, error: currentError } = await supabase
          .from('Policies')
          .select('id, parent_policy_id')
          .eq('id', policyId)
          .single();

        if (currentError) {
          console.error('Error fetching current policy:', currentError);
          return;
        }

        const effectiveParentId = currentPolicy.parent_policy_id || currentPolicy.id;
        setParentPolicyId(effectiveParentId);

        // Get all versions in this policy family
        const { data: versionData, error: versionError } = await supabase
          .from('Policies')
          .select(`
            *,
            creator:creator_id(id, name, email),
            publisher:publisher_id(id, name, email)
          `)
          .or(`id.eq.${effectiveParentId},parent_policy_id.eq.${effectiveParentId}`)
          .order('created_at', { ascending: false });

        if (versionError) {
          console.error('Error fetching version history:', versionError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load version history.",
          });
          return;
        }

        console.log('=== VERSION HISTORY LOADED ===', versionData);
        setVersions(versionData || []);
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

  const getVersionNumber = (policyName: string | null): string => {
    if (!policyName) return 'Unknown';
    const match = policyName.match(/v(\d+\.\d+)$/);
    return match ? match[1] : '1.0';
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under-review':
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  if (versions.length <= 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No version history available. This is the original policy.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History ({versions.length} versions)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                version.id === policyId ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    Version {getVersionNumber(version.name)}
                  </span>
                  <Badge variant="outline" className={getStatusColor(version.status)}>
                    {version.status || 'Unknown'}
                  </Badge>
                  {index === 0 && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Latest
                    </Badge>
                  )}
                  {version.id === policyId && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      Current View
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(version.created_at).toLocaleDateString()}</span>
                  </div>
                  {(version as any).creator && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>by {(version as any).creator.name}</span>
                    </div>
                  )}
                  {version.published_at && (
                    <div className="flex items-center gap-1">
                      <span>Published: {new Date(version.published_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onViewVersion && version.id !== policyId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewVersion(version.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
