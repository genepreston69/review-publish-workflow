
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
} from "@/components/ui/sidebar";
import { 
  Shield, Users, FileText, FileClock, FileCheck, Plus, BookOpen, 
  Building, Eye, CheckCircle, BarChart3, Settings 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export function AppSidebar() {
  const { userRole } = useAuth();
  const { activeSection, navigateToSection } = useAppNavigation();

  const isEditor = userRole === 'edit';
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isSuperAdmin = userRole === 'super-admin';
  const isReadOnly = userRole === 'read-only';

  // Policy items - HR Policies now available for all users
  const policyItems = [
    {
      id: "hr-policies",
      title: "HR Policies",
      icon: Users,
    },
    {
      id: "facility-policies", 
      title: "Facility Policies",
      icon: Building,
    },
    ...(!isReadOnly ? [{
      id: "create-policy",
      title: "Create Policy",
      icon: Plus,
    }] : []),
    ...(isEditor ? [{
      id: "draft-policies",
      title: "Draft Policies",
      icon: FileClock,
    }] : []),
    ...(canPublish && !isEditor ? [{
      id: "review-policies",
      title: "Review Policies",
      icon: FileCheck,
    }] : []),
    {
      id: "policy-manuals",
      title: "Policy Manuals",
      icon: BookOpen,
    },
  ];

  // Admin items (super-admin only)
  const adminItems = isSuperAdmin ? [
    {
      id: "users",
      title: "User Management",
      icon: Users,
    },
    {
      id: "assignments",
      title: "Assignments",
      icon: FileText,
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: BarChart3,
    },
    {
      id: "moderation",
      title: "Content Moderation",
      icon: FileText,
    },
  ] : [];

  const renderMenuSection = (items: any[], sectionTitle: string) => {
    if (items.length === 0) return null;
    
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{sectionTitle}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  onClick={() => {
                    console.log('=== SIDEBAR NAVIGATION ===');
                    console.log('Clicked item:', item.id);
                    console.log('Current activeSection:', activeSection);
                    navigateToSection(item.id);
                    console.log('After navigation call');
                  }}
                  isActive={activeSection === item.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-600" />
          <span className="font-semibold text-lg">
            {isReadOnly ? 'Policy Portal' : 'Content Management'}
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {renderMenuSection(policyItems, "Policies")}
        {renderMenuSection(adminItems, "Administration")}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Settings className="w-4 h-4" />
          <span>
            {isSuperAdmin && "Super Admin"}
            {canPublish && !isSuperAdmin && "Publisher"}
            {isEditor && "Editor"}
            {isReadOnly && "Read Only"}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
