
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
    console.log('=== GET DEFAULT SECTION ===');
    console.log('Current pathname:', location.pathname);
    console.log('Current search params:', location.search);
    
    if (location.pathname === '/admin') {
      const tabParam = searchParams.get('tab');
      console.log('Admin route - tab param:', tabParam);
      return tabParam || 'create-policy';
    }
    
    // Main dashboard - check for section parameter first
    const sectionParam = searchParams.get('section');
    console.log('Main route - section param:', sectionParam);
    if (sectionParam) {
      return sectionParam;
    }
    
    // Fall back to role-based defaults if no URL parameter
    // Now all users default to hr-policies as the first policy section
    console.log('No URL param found, defaulting to hr-policies');
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
    console.log('Current pathname:', location.pathname);
    
    // Update the active section immediately
    setActiveSection(sectionId);
    console.log('Set activeSection to:', sectionId);
    
    // Define admin-only sections
    const adminOnlySections = [
      'create-policy', 'draft-policies', 'review-policies', 
      'policy-manuals', 'users', 'assignments', 'analytics', 'moderation'
    ];
    
    // Define sections that are available on both admin and main routes
    const sharedSections = ['hr-policies', 'facility-policies'];
    
    if (adminOnlySections.includes(sectionId)) {
      console.log('Navigating to admin-only section:', `/admin?tab=${sectionId}`);
      navigate(`/admin?tab=${sectionId}`);
    } else if (sharedSections.includes(sectionId)) {
      // For shared sections, stay on the current route type but update the parameter
      if (location.pathname === '/admin') {
        console.log('Staying on admin route for shared section:', `/admin?tab=${sectionId}`);
        navigate(`/admin?tab=${sectionId}`);
      } else {
        console.log('Staying on main route for shared section:', `/?section=${sectionId}`);
        navigate(`/?section=${sectionId}`);
      }
    } else {
      // Default to main route for other sections
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
