
import React from 'react';
import { useAuth } from '@/components/SafeAuthProvider';

export const AuthDebugger = () => {
  const { user, userRole, isLoading } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-1">
        <div>User: {user?.email || 'None'}</div>
        <div>Role: {userRole}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>User ID: {user?.id || 'None'}</div>
      </div>
    </div>
  );
};
