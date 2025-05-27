
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
    <div className="fixed left-0 top-0 h-screen w-64 border-r bg-white z-20 overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-600" />
          <span className="font-semibold text-lg">Admin Panel</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Policies</h3>
            <div className="space-y-2">
              {policyItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => onTabChange(item.tabValue)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === item.tabValue 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4 inline mr-2" />
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {isSuperAdmin && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Administration</h3>
              <div className="space-y-2">
                {adminItems.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => onTabChange(item.tabValue)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === item.tabValue 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4 inline mr-2" />
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Settings className="w-4 h-4" />
          <span>
            {isSuperAdmin && "Super Admin Dashboard"}
            {canPublish && !isSuperAdmin && "Publisher Dashboard"}
            {isEditor && "Editor Dashboard"}
          </span>
        </div>
      </div>
    </div>
  );
}
