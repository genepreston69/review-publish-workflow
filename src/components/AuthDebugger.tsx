
import React from 'react';
import { useAuth } from './SafeAuthProvider';

export const AuthDebugger: React.FC = () => {
  const { currentUser, session, userRole, isLoading, error } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>User: {currentUser ? currentUser.email : 'None'}</div>
      <div>Role: {userRole || 'None'}</div>
      <div>Session: {session ? 'Active' : 'None'}</div>
      {error && <div className="text-red-300">Error: {error}</div>}
    </div>
  );
};
