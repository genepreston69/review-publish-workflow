
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Calendar, User, CheckCircle, XCircle } from 'lucide-react';

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
  const { userRole } = useAuth();
  const { toast } = useToast();

  const canPublish = userRole === 'publish' || userRole === 'super-admin';

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const { data, error } = await supabase
          .from('Policies')
          .select('*')
          .order('created_at', { ascending: false });

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
    }

    fetchPolicies();
  }, [toast]);

  const updatePolicyStatus = async (policyId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('Policies')
        .update({ status: newStatus })
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Policy ${newStatus === 'active' ? 'published' : 'rejected'} successfully.`,
      });

      // Refresh policies
      const { data } = await supabase
        .from('Policies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setPolicies(data);
      }
    } catch (error) {
      console.error('Error updating policy status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update policy status.",
      });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active':
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
            Manage and review facility policies and procedures
          </p>
        </div>
      </div>

      {policies.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No policies found</h3>
              <p className="text-gray-500">No facility policies have been created yet.</p>
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

                  {/* Publisher Actions */}
                  {canPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review') && (
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        onClick={() => updatePolicyStatus(policy.id, 'active')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePolicyStatus(policy.id, 'archived')}
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
