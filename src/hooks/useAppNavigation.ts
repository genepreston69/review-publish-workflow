
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

export interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  section: 'content' | 'policies' | 'admin';
}

export function useAppNavigation() {
  const { userRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine default section based on current route and user role
  const getDefaultSection = () => {
    if (location.pathname === '/admin') {
      return searchParams.get('tab') || 'create-policy';
    }
    
    // Main dashboard - check for section parameter first
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      return sectionParam;
    }
    
    // Fall back to role-based defaults if no URL parameter
    if (userRole === 'read-only') {
      return 'hr-policies';
    }
    return 'all';
  };

  const [activeSection, setActiveSection] = useState(getDefaultSection());

  // Update active section when URL changes
  useEffect(() => {
    const newSection = getDefaultSection();
    setActiveSection(newSection);
  }, [searchParams, location.pathname, userRole]);

  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    
    // Determine if this is an admin section or main dashboard section
    const adminSections = [
      'create-policy', 'draft-policies', 'review-policies', 'facility-policies',
      'policy-manuals', 'users', 'assignments', 'analytics', 'moderation'
    ];
    
    if (adminSections.includes(sectionId)) {
      navigate(`/admin?tab=${sectionId}`);
    } else {
      navigate(`/?section=${sectionId}`);
    }
  };

  return {
    activeSection,
    setActiveSection,
    navigateToSection,
  };
}
