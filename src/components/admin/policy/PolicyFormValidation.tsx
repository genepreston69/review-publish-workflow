
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface PolicyFormValidationProps {
  hasEditAccess?: boolean;
}

export function PolicyFormValidation({ hasEditAccess }: PolicyFormValidationProps) {
  const { userRole } = useUserRole();
  
  // If hasEditAccess is provided, use it; otherwise calculate from userRole
  const canEdit = hasEditAccess !== undefined 
    ? hasEditAccess 
    : userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  if (!canEdit) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Plus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Access Denied</h3>
            <p className="text-gray-500">You need edit access or higher to create policies.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
