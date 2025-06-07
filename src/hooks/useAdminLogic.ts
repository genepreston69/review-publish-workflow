
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';

export function useAdminLogic() {
  const { userRole } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'create-policy');

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const isEditor = userRole === 'edit';
  const canPublish = userRole === 'publish' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  const getPageTitle = () => {
    if (userRole === 'admin') return 'Admin Dashboard';
    if (userRole === 'publish') return 'Publisher Dashboard';
    if (userRole === 'edit') return 'Editor Dashboard';
    return 'Dashboard';
  };

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  return {
    activeTab,
    setActiveTab,
    isEditor,
    canPublish,
    isSuperAdmin: isAdmin,
    getPageTitle,
    handleTabChange
  };
}
