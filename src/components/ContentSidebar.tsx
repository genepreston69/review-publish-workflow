
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  PlusCircle, 
  Calendar, 
  User,
  Settings,
  LayoutDashboard,
  Plus
} from 'lucide-react';

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

export function ContentSidebar() {
  console.log('=== CONTENT SIDEBAR RENDERING ===');
  
  const { userRole } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        console.log('=== FETCHING FACILITY POLICIES FOR SIDEBAR ===');
        setIsLoadingPolicies(true);
        
        const { data, error } = await supabase
          .from('Policies')
          .select('*')
          .eq('status', 'published')
          .order('policy_number', { ascending: true })
          .limit(10); // Limit to avoid overcrowding sidebar

        console.log('=== FACILITY POLICIES SIDEBAR RESPONSE ===', { data, error });

        if (error) {
          console.error('Error fetching policies:', error);
        } else {
          setPolicies(data || []);
        }
      } catch (error) {
        console.error('Error fetching policies:', error);
      } finally {
        setIsLoadingPolicies(false);
      }
    };

    fetchPolicies();
  }, []);

  console.log('=== SIDEBAR RENDER STATE ===', { userRole, policiesCount: policies.length });

  const canCreateContent = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';
  const canCreatePolicies = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  const handleCreatePolicy = () => {
    // Open in new tab to avoid changing the current context
    window.open('/admin?tab=create-policy', '_blank');
  };

  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    ...(canCreateContent ? [{
      title: "Create Content",
      icon: PlusCircle,
      isActive: false,
    }] : []),
    ...(canCreatePolicies ? [{
      title: "Create Policy",
      icon: Plus,
      isActive: false,
      onClick: handleCreatePolicy,
    }] : []),
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold">Content Hub</h2>
            <p className="text-sm text-muted-foreground">Manage content & policies</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Navigation */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Navigation</h3>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.title}
                onClick={item.onClick}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  item.isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                } ${item.onClick ? 'cursor-pointer' : ''}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Facility Policies */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" />
            <h3 className="text-sm font-medium text-gray-500">Facility Policies</h3>
          </div>
          
          {isLoadingPolicies ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            </div>
          ) : policies.length === 0 ? (
            <p className="text-xs text-gray-500">No published policies found</p>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-64">
              {policies.map((policy) => (
                <div key={policy.id} className="bg-gray-50 p-2 rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-gray-900 truncate">
                        {policy.name || 'Untitled Policy'}
                      </h4>
                      {policy.policy_number && (
                        <p className="text-xs text-gray-500 font-mono">
                          {policy.policy_number}
                        </p>
                      )}
                    </div>
                  </div>
                  {policy.purpose && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {stripHtml(policy.purpose)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {userRole === 'super-admin' && (
        <div className="border-t p-4">
          <a 
            href="/admin" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </a>
        </div>
      )}
    </div>
  );
}
