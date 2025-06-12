
import { useState } from 'react';
import { authConfig, setMockUserRole } from '@/config/authConfig';
import { UserRole } from '@/types/user';
import { useMockAuth } from '@/hooks/useMockAuth';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Settings } from 'lucide-react';

export const MockAuthBanner = () => {
  const { userRole, switchRole } = useMockAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!authConfig.useMockAuth) {
    return null;
  }

  const handleRoleChange = (newRole: UserRole) => {
    setMockUserRole(newRole);
    switchRole(newRole);
  };

  return (
    <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
          <div>
            <p className="text-sm font-medium text-orange-800">
              Mock Authentication Mode Active
            </p>
            <p className="text-xs text-orange-700">
              Currently testing as: <strong>{authConfig.mockUser.name}</strong> with role: <strong>{userRole}</strong>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-orange-800 border-orange-300"
        >
          <Settings className="h-4 w-4 mr-1" />
          {isExpanded ? 'Hide' : 'Settings'}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-orange-800">
              Switch Role:
            </label>
            <Select value={userRole || ''} onValueChange={(value: UserRole) => handleRoleChange(value)}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read-only">Read Only</SelectItem>
                <SelectItem value="edit">Editor</SelectItem>
                <SelectItem value="publish">Publisher</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};
