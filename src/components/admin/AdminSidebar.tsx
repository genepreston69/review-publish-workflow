
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Shield, 
  BarChart3, 
  Plus, 
  FileClock, 
  FileCheck,
  BookOpen,
  ClipboardList,
  Link as LinkIcon,
  Archive,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const AdminSidebar = () => {
  const { userRole } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['policies', 'forms']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isEditor = userRole === 'edit';
  const canPublish = userRole === 'publish' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  const getTabUrl = (tab: string) => `/admin?tab=${tab}`;

  const isActiveTab = (tab: string) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') === tab;
  };

  const policyItems = [
    {
      title: "Create Policy",
      icon: Plus,
      tab: "create-policy",
      show: true,
    },
    ...(isEditor ? [{
      title: "Draft Policies",
      icon: FileClock,
      tab: "draft-policies",
      show: true,
    }] : []),
    ...(canPublish && !isEditor ? [{
      title: "Review Policies",
      icon: FileCheck,
      tab: "review-policies",
      show: true,
    }] : []),
    {
      title: "Facility Policies",
      icon: FileText,
      tab: "facility-policies",
      show: true,
    },
    {
      title: "HR Policies",
      icon: BookOpen,
      tab: "hr-policies",
      show: true,
    },
    {
      title: "Policy Manuals",
      icon: BookOpen,
      tab: "policy-manuals",
      show: true,
    },
    ...(isAdmin ? [{
      title: "Archived Policies",
      icon: Archive,
      tab: "archived-policies",
      show: true,
    }] : []),
  ];

  const formItems = [
    {
      title: "Create Form",
      icon: ClipboardList,
      tab: "create-form",
      show: true,
    },
    ...(isEditor ? [{
      title: "Draft Forms",
      icon: FileClock,
      tab: "draft-forms",
      show: true,
    }] : []),
    ...(canPublish && !isEditor ? [{
      title: "Review Forms",
      icon: FileCheck,
      tab: "review-forms",
      show: true,
    }] : []),
    {
      title: "Published Forms",
      icon: ClipboardList,
      tab: "published-forms",
      show: true,
    },
  ];

  const adminItems = [
    {
      title: "User Management",
      icon: Users,
      tab: "users",
      show: isAdmin,
    },
    {
      title: "Assignments",
      icon: LinkIcon,
      tab: "assignments",
      show: isAdmin,
    },
    {
      title: "Analytics",
      icon: BarChart3,
      tab: "analytics",
      show: isAdmin,
    },
    {
      title: "Content Moderation",
      icon: FileText,
      tab: "moderation",
      show: isAdmin,
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Panel</h2>
        
        <nav className="space-y-2">
          {/* Policies Section */}
          <div>
            <button
              onClick={() => toggleSection('policies')}
              className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>Policies</span>
              </div>
              {expandedSections.includes('policies') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.includes('policies') && (
              <div className="ml-6 mt-1 space-y-1">
                {policyItems.filter(item => item.show).map((item) => (
                  <Link
                    key={item.tab}
                    to={getTabUrl(item.tab)}
                    className={cn(
                      "flex items-center p-2 text-sm rounded-md transition-colors",
                      isActiveTab(item.tab)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Forms Section */}
          <div>
            <button
              onClick={() => toggleSection('forms')}
              className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <div className="flex items-center">
                <ClipboardList className="w-4 h-4 mr-2" />
                <span>Forms</span>
              </div>
              {expandedSections.includes('forms') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.includes('forms') && (
              <div className="ml-6 mt-1 space-y-1">
                {formItems.filter(item => item.show).map((item) => (
                  <Link
                    key={item.tab}
                    to={getTabUrl(item.tab)}
                    className={cn(
                      "flex items-center p-2 text-sm rounded-md transition-colors",
                      isActiveTab(item.tab)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div>
              <button
                onClick={() => toggleSection('admin')}
                className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Administration</span>
                </div>
                {expandedSections.includes('admin') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections.includes('admin') && (
                <div className="ml-6 mt-1 space-y-1">
                  {adminItems.filter(item => item.show).map((item) => (
                    <Link
                      key={item.tab}
                      to={getTabUrl(item.tab)}
                      className={cn(
                        "flex items-center p-2 text-sm rounded-md transition-colors",
                        isActiveTab(item.tab)
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
        
        {/* Role Badge */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Badge variant="outline" className="w-full justify-center">
            {userRole === 'edit' && 'Editor'}
            {userRole === 'publish' && 'Publisher'}
            {userRole === 'admin' && 'Admin'}
          </Badge>
        </div>
      </div>
    </div>
  );
};
