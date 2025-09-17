// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts

export const usePortalNavigation = (
  onNavigationChange?: (sectionId: string) => void
) => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Navigation handling
  const handleNavigationClick = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    onNavigationChange?.(sectionId);
    setIsMobileMenuOpen(false);
  }, [onNavigationChange]);
  
  return {
    activeSection,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleNavigationClick
  };
};