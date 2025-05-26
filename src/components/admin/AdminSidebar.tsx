
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
import { Shield, FileText, Users, Link, BarChart3, Settings, Plus } from 'lucide-react';

const menuItems = [
  {
    title: "Create Policy",
    icon: Plus,
    tabValue: "create-policy",
  },
  {
    title: "Facility Policies",
    icon: FileText,
    tabValue: "facility-policies",
  },
];

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
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Settings className="w-4 h-4" />
          <span>Super Admin Dashboard</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
