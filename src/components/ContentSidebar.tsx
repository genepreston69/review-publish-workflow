
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  PlusCircle, 
  Calendar, 
  User,
  Settings,
  LayoutDashboard 
} from 'lucide-react';

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

const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
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

export function ContentSidebar() {
  console.log('=== CONTENT SIDEBAR RENDERING ===');
  
  const [userRole] = useState<string | null>('read-only');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);

  useEffect(() => {
    console.log('=== CONTENT SIDEBAR USEEFFECT RUNNING ===');
    
    const fetchPolicies = async () => {
      try {
        console.log('=== FETCHING POLICIES START ===');
        setIsLoadingPolicies(true);
        
        const { data, error } = await supabase
          .from('Policies')
          .select('*')
          .eq('status', 'active')
          .order('policy_number', { ascending: true });

        console.log('=== POLICIES RESPONSE ===', { data, error });

        if (error) {
          console.error('Error fetching policies:', error);
        } else {
          console.log('Policies fetched successfully:', data);
          setPolicies(data || []);
        }
      } catch (error) {
        console.error('Error in fetchPolicies:', error);
      } finally {
        setIsLoadingPolicies(false);
        console.log('=== POLICIES LOADING COMPLETE ===');
      }
    };

    fetchPolicies();
  }, []);

  console.log('=== SIDEBAR RENDER STATE ===', { userRole, policies: policies.length, isLoadingPolicies });

  const canCreateContent = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

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
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold">Content Hub</h2>
            <p className="text-sm text-muted-foreground">Manage content & policies</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.isActive}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Facility Policies
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="max-h-96 overflow-y-auto">
              {isLoadingPolicies ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading policies...
                </div>
              ) : policies.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No active policies found
                </div>
              ) : (
                <div className="space-y-3 p-2">
                  {policies.map((policy) => (
                    <Card key={policy.id} className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm leading-tight">
                              {policy.name || 'Untitled Policy'}
                            </CardTitle>
                            {policy.policy_number && (
                              <CardDescription className="font-mono text-xs">
                                {policy.policy_number}
                              </CardDescription>
                            )}
                          </div>
                          {policy.status && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getStatusColor(policy.status)}`}
                            >
                              {policy.status}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {policy.purpose && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {stripHtml(policy.purpose)}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {policy.reviewer && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="truncate">{stripHtml(policy.reviewer)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(policy.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {userRole === 'super-admin' && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/admin" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
