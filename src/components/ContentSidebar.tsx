
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

export function ContentSidebar() {
  console.log('=== CONTENT SIDEBAR RENDERING ===');
  
  const { userRole } = useAuth();
  const [policyCount, setPolicyCount] = useState(0);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);

  useEffect(() => {
    console.log('=== CONTENT SIDEBAR USEEFFECT RUNNING ===');
    console.log('=== USER ROLE FROM AUTH ===', userRole);
    
    const fetchPolicyCount = async () => {
      try {
        console.log('=== FETCHING POLICY COUNT START ===');
        setIsLoadingPolicies(true);
        
        const { count, error } = await supabase
          .from('Policies')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');

        console.log('=== POLICY COUNT RESPONSE ===', { count, error });

        if (error) {
          console.error('Error fetching policy count:', error);
        } else {
          console.log('Policy count fetched successfully:', count);
          setPolicyCount(count || 0);
        }
      } catch (error) {
        console.error('Error in fetchPolicyCount:', error);
      } finally {
        setIsLoadingPolicies(false);
        console.log('=== POLICY COUNT LOADING COMPLETE ===');
      }
    };

    fetchPolicyCount();
  }, []);

  console.log('=== SIDEBAR RENDER STATE ===', { userRole, policyCount, isLoadingPolicies });

  const canCreateContent = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';
  const canCreatePolicies = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  const handleCreatePolicy = () => {
    console.log('=== CREATE POLICY BUTTON CLICKED ===', { currentUserRole: userRole });
    // Navigate to admin dashboard with create policy tab - don't open in new tab
    // This was causing issues by opening in a different context
    window.location.href = '/admin?tab=create-policy';
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

        {/* Policy Summary */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <h3 className="text-sm font-medium text-gray-500">Facility Policies</h3>
            </div>
            {!isLoadingPolicies && (
              <Badge variant="secondary" className="text-xs">
                {policyCount} published
              </Badge>
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {isLoadingPolicies ? (
              <p>Loading policy count...</p>
            ) : (
              <p>View all policies in the main content area</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {userRole === 'super-admin' && (
        <div className="border-t p-4">
          <a 
            href="/admin" 
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
