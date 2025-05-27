
import { useState, useEffect } from 'react';
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

interface ContentSidebarProps {
  activeView: 'content' | 'policies';
  onViewChange: (view: 'content' | 'policies') => void;
}

export function ContentSidebar({ activeView, onViewChange }: ContentSidebarProps) {
  console.log('=== CONTENT SIDEBAR RENDERING ===');
  
  const { userRole } = useAuth();

  console.log('=== SIDEBAR RENDER STATE ===', { userRole, activeView });

  const canCreateContent = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';
  const canCreatePolicies = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  const handleCreatePolicy = () => {
    // Open in new tab to avoid changing the current context
    window.open('/admin?tab=create-policy', '_blank');
  };

  const navigationItems = [
    {
      title: "Content Management",
      icon: LayoutDashboard,
      isActive: activeView === 'content',
      onClick: () => onViewChange('content'),
    },
    {
      title: "Facility Policies",
      icon: FileText,
      isActive: activeView === 'policies',
      onClick: () => onViewChange('policies'),
    },
    ...(canCreateContent ? [{
      title: "Create Content",
      icon: PlusCircle,
      isActive: false,
      onClick: () => {
        // TODO: Implement content creation
        console.log('Create content clicked');
      },
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
                } cursor-pointer`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
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
