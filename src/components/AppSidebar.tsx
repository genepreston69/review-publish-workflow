
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
  Users, FileText, FileClock, FileCheck, Plus, BookOpen, 
  Building, Eye, CheckCircle, BarChart3, Settings, ClipboardList, Archive 
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
  const hasAdminAccess = !isReadOnly; // editors, publishers, and super-admins

  // Policy items - available to all users
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
    ...(isSuperAdmin ? [{
      id: "archived-policies",
      title: "Archived Policies",
      icon: Archive,
    }] : []),
  ];

  // Form items - available to non-read-only users
  const formItems = hasAdminAccess ? [
    {
      id: "create-form",
      title: "Create Form",
      icon: ClipboardList,
    },
    ...(isEditor ? [{
      id: "draft-forms",
      title: "Draft Forms",
      icon: FileClock,
    }] : []),
    ...(canPublish && !isEditor ? [{
      id: "review-forms",
      title: "Review Forms",
      icon: FileCheck,
    }] : []),
    {
      id: "published-forms",
      title: "Published Forms",
      icon: ClipboardList,
    },
  ] : [];

  // Tools items - available to all users (including read-only for policy manuals)
  const toolsItems = [
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
        <SidebarGroupLabel className="text-base text-black">{sectionTitle}</SidebarGroupLabel>
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
      <SidebarHeader className="p-6">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/574646d6-6de7-444f-a9a2-327c1a816521.png" 
            alt="Recovery Point West Virginia" 
            className="h-16 w-auto max-w-full"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {renderMenuSection(policyItems, "Policies")}
        {renderMenuSection(formItems, "Forms")}
        {renderMenuSection(toolsItems, "Tools")}
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
