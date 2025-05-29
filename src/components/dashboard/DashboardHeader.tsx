
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DashboardHeaderProps {
  userRole: string | null;
  canCreate: boolean;
  onCreateNew: () => void;
}

export const DashboardHeader = ({ userRole, canCreate, onCreateNew }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
        <p className="text-gray-600">
          Manage your content across different stages • Role: {userRole}
        </p>
      </div>
      {canCreate && (
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Content
        </Button>
      )}
    </div>
  );
};
