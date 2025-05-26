
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
import { Shield, Users, Link, BarChart3, Settings, Plus, FileText, FileClock, FileCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const adminItems = [
  {
    title: "User Management",
    icon: Users,
    tabValue: "users",
  },
  {
    title: "Assignments",
    icon: Link,
    tabValue: "assignments",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    tabValue: "analytics",
  },
  {
    title: "Content Moderation",
    icon: FileText,
    tabValue: "moderation",
  },
];

interface AdminSidebarProps {
  onTabChange: (tabValue: string) => void;
  activeTab: string;
}

export function AdminSidebar({ onTabChange, activeTab }: AdminSidebarProps) {
  const { userRole } = useAuth();

  const isEditor = userRole === 'edit';
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isSuperAdmin = userRole === 'super-admin';

  const policyItems = [
    {
      title: "Create Policy",
      icon: Plus,
      tabValue: "create-policy",
    },
    ...(isEditor ? [{
      title: "Draft Policies",
      icon: FileClock,
      tabValue: "draft-policies",
    }] : []),
    ...(canPublish && !isEditor ? [{
      title: "Review Policies",
      icon: FileCheck,
      tabValue: "review-policies",
    }] : []),
    {
      title: "Facility Policies",
      icon: FileText,
      tabValue: "facility-policies",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-600" />
          <span className="font-semibold text-lg">Admin Panel</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Policies</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {policyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.tabValue)}
                    isActive={activeTab === item.tabValue}
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

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => onTabChange(item.tabValue)}
                      isActive={activeTab === item.tabValue}
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
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Settings className="w-4 h-4" />
          <span>
            {isSuperAdmin && "Super Admin Dashboard"}
            {canPublish && !isSuperAdmin && "Publisher Dashboard"}
            {isEditor && "Editor Dashboard"}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
