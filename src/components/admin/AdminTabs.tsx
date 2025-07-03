
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Link, BarChart3, FileText, Plus, FileClock, FileCheck, BookOpen, ClipboardList } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export function AdminTabs() {
  const { userRole } = useUserRole();

  const isEditor = userRole === 'edit';
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isSuperAdmin = userRole === 'super-admin';

  const policyTabs = [
    {
      title: "Create Policy",
      icon: Plus,
      value: "create-policy",
    },
    ...(isEditor ? [{
      title: "Draft Policies",
      icon: FileClock,
      value: "draft-policies",
    }] : []),
    ...(canPublish && !isEditor ? [{
      title: "Review Policies",
      icon: FileCheck,
      value: "review-policies",
    }] : []),
    {
      title: "Facility Policies",
      icon: FileText,
      value: "facility-policies",
    },
    {
      title: "Policy Manuals",
      icon: BookOpen,
      value: "policy-manuals",
    },
  ];

  const formTabs = [
    {
      title: "Create Form",
      icon: ClipboardList,
      value: "create-form",
    },
    ...(isEditor ? [{
      title: "Draft Forms",
      icon: FileClock,
      value: "draft-forms",
    }] : []),
    ...(canPublish && !isEditor ? [{
      title: "Review Forms",
      icon: FileCheck,
      value: "review-forms",
    }] : []),
    {
      title: "Published Forms",
      icon: ClipboardList,
      value: "published-forms",
    },
  ];

  const adminTabs = [
    {
      title: "User Management",
      icon: Users,
      value: "users",
    },
    {
      title: "Assignments",
      icon: Link,
      value: "assignments",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      value: "analytics",
    },
    {
      title: "Content Moderation",
      icon: FileText,
      value: "moderation",
    },
  ];

  const allTabs = [...policyTabs, ...formTabs, ...(isSuperAdmin ? adminTabs : [])];

  return (
    <div className="mb-6">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${allTabs.length}, 1fr)` }}>
        {allTabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.title}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
