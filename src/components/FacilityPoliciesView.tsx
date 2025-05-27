
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, Loader2 } from 'lucide-react';

const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

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

export function FacilityPoliciesView() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        console.log('=== FETCHING FACILITY POLICIES FOR MAIN VIEW ===');
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('Policies')
          .select('*')
          .eq('status', 'active')
          .order('policy_number', { ascending: true });

        console.log('=== FACILITY POLICIES MAIN VIEW RESPONSE ===', { data, error });

        if (error) {
          console.error('Error fetching policies:', error);
        } else {
          setPolicies(data || []);
        }
      } catch (error) {
        console.error('Error fetching policies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Facility Policies</h2>
        <p className="text-gray-600">
          Browse and view published facility policies
        </p>
      </div>

      {policies.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-500 mt-4">No published policies found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {policy.name || 'Untitled Policy'}
                    </CardTitle>
                    {policy.policy_number && (
                      <p className="text-sm text-gray-500 font-mono mt-1">
                        {policy.policy_number}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policy.purpose && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Purpose</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {stripHtml(policy.purpose)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                    {policy.reviewer && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-24">{stripHtml(policy.reviewer)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(policy.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
