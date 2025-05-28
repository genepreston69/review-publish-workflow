import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Calendar, User, Trash2, Eye, RotateCcw } from 'lucide-react';
import { PolicyViewModal } from './policy/PolicyViewModal';

interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  policy_text: string | null;
  procedure: string | null;
  purpose: string | null;
  reviewer: string | null;
  status: string | null;
  created_at: string;
}

// Function to strip HTML tags from text
const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export function FacilityPolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const { userRole } = useAuth();
  const { toast } = useToast();

  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isSuperAdmin = userRole === 'super-admin';
  const isEditor = userRole === 'edit';

  useEffect(() => {
    fetchPolicies();
  }, [toast]);

  const fetchPolicies = async () => {
    try {
      console.log('=== FETCHING FACILITY POLICIES ===');
      const { data, error } = await supabase
        .from('Policies')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      console.log('=== FACILITY POLICIES RESPONSE ===', { data, error });

      if (error) {
        console.error('Error fetching policies:', error);
      } else {
        // Sort policies by policy number
        const sortedPolicies = (data || []).sort((a, b) => {
          // Handle null policy numbers by placing them at the end
          if (!a.policy_number && !b.policy_number) return 0;
          if (!a.policy_number) return 1;
          if (!b.policy_number) return -1;
          
          // Sort numerically if both are numbers, otherwise alphabetically
          const aNum = parseFloat(a.policy_number);
          const bNum = parseFloat(b.policy_number);
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          
          return a.policy_number.localeCompare(b.policy_number);
        });
        
        console.log('=== SORTED FACILITY POLICIES ===', sortedPolicies);
        setPolicies(sortedPolicies);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load policies.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPolicy = (policyId: string) => {
    setViewingPolicyId(policyId);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  const updatePolicyStatus = async (policyId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('Policies')
        .update({ status: newStatus })
        .eq('id', policyId);

      if (error) throw error;

      const statusMessage = newStatus === 'draft' 
        ? 'Policy returned to draft status for editing'
        : `Policy ${newStatus === 'published' ? 'published' : 'rejected'} successfully`;

      toast({
        title: "Success",
        description: statusMessage,
      });

      // Refresh policies
      fetchPolicies();
    } catch (error) {
      console.error('Error updating policy status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update policy status.",
      });
    }
  };

  const deletePolicy = async (policyId: string) => {
    if (!isSuperAdmin) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only super admins can delete policies.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('Policies')
        .delete()
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Policy deleted successfully.",
      });

      // Refresh policies
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete policy.",
      });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'under-review':
      case 'under review':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Facility Policies</h2>
          <p className="text-muted-foreground">
            View published facility policies and procedures
          </p>
        </div>
      </div>

      {policies.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No published policies found</h3>
              <p className="text-gray-500">No facility policies have been published yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {policy.name || 'Untitled Policy'}
                    </CardTitle>
                    {policy.policy_number && (
                      <CardDescription className="font-mono text-sm">
                        {policy.policy_number}
                      </CardDescription>
                    )}
                  </div>
                  {policy.status && (
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(policy.status)}
                    >
                      {policy.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policy.purpose && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Purpose</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {stripHtml(policy.purpose)}
                      </p>
                    </div>
                  )}
                  
                  {policy.procedure && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Procedure</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {stripHtml(policy.procedure)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    {policy.reviewer && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{stripHtml(policy.reviewer)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(policy.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t space-y-2">
                    {/* View Button for all published policies */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewPolicy(policy.id)}
                      className="w-full text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Policy
                    </Button>

                    {/* Update Policy Button - Show for users with edit/publish permissions */}
                    {(isEditor || canPublish) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePolicyStatus(policy.id, 'draft')}
                        className="w-full text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Update Policy
                      </Button>
                    )}

                    {/* Super Admin Delete Action for published policies */}
                    {isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePolicy(policy.id)}
                        className="w-full text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete Policy
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewingPolicyId && (
        <PolicyViewModal
          policyId={viewingPolicyId}
          onClose={handleCloseView}
          onUpdateStatus={updatePolicyStatus}
        />
      )}
    </div>
  );
}
