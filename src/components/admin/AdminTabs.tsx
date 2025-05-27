
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Link, BarChart3, FileText, Plus, FileClock, FileCheck } from 'lucide-react';

interface AdminTabsProps {
  isSuperAdmin: boolean;
  isEditor: boolean;
  canPublish: boolean;
  getTabsGridCols: () => string;
}

export function AdminTabs({ isSuperAdmin, isEditor, canPublish, getTabsGridCols }: AdminTabsProps) {
  if (isSuperAdmin) {
    return (
      <TabsList className={`grid w-full ${getTabsGridCols()} mb-8`}>
        <TabsTrigger value="create-policy" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Policy
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          User Management
        </TabsTrigger>
        <TabsTrigger value="assignments" className="flex items-center gap-2">
          <Link className="w-4 h-4" />
          Assignments
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Analytics
        </TabsTrigger>
      </TabsList>
    );
  }

  return (
    <TabsList className={`grid w-full ${getTabsGridCols()} mb-8`}>
      <TabsTrigger value="create-policy" className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Create Policy
      </TabsTrigger>
      {isEditor && (
        <TabsTrigger value="draft-policies" className="flex items-center gap-2">
          <FileClock className="w-4 h-4" />
          Draft Policies
        </TabsTrigger>
      )}
      {canPublish && !isEditor && (
        <TabsTrigger value="review-policies" className="flex items-center gap-2">
          <FileCheck className="w-4 h-4" />
          Review Policies
        </TabsTrigger>
      )}
      <TabsTrigger value="facility-policies" className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Facility Policies
      </TabsTrigger>
    </TabsList>
  );
}
