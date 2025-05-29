
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
    // Now all users default to hr-policies as the first policy section
    return 'hr-policies';
  };

  const [activeSection, setActiveSection] = useState(getDefaultSection());

  // Update active section when URL changes
  useEffect(() => {
    const newSection = getDefaultSection();
    console.log('=== NAVIGATION HOOK URL CHANGE ===');
    console.log('New section from URL:', newSection);
    console.log('Current activeSection:', activeSection);
    if (newSection !== activeSection) {
      setActiveSection(newSection);
      console.log('Updated activeSection to:', newSection);
    }
  }, [searchParams, location.pathname, userRole]);

  const navigateToSection = (sectionId: string) => {
    console.log('=== NAVIGATE TO SECTION ===');
    console.log('Navigating to:', sectionId);
    console.log('Current activeSection before:', activeSection);
    
    // Update the active section immediately
    setActiveSection(sectionId);
    console.log('Set activeSection to:', sectionId);
    
    // Determine if this is an admin section or main dashboard section
    const adminSections = [
      'create-policy', 'draft-policies', 'review-policies', 'facility-policies',
      'policy-manuals', 'users', 'assignments', 'analytics', 'moderation'
    ];
    
    if (adminSections.includes(sectionId)) {
      console.log('Navigating to admin section:', `/admin?tab=${sectionId}`);
      navigate(`/admin?tab=${sectionId}`);
    } else {
      console.log('Navigating to main section:', `/?section=${sectionId}`);
      navigate(`/?section=${sectionId}`);
    }
  };

  return {
    activeSection,
    setActiveSection,
    navigateToSection,
  };
}
