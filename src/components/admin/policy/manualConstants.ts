
export const MANUAL_CONSTANTS = {
  // TOC page calculations
  ENTRIES_ON_FIRST_TOC_PAGE: 19,
  ENTRIES_ON_SUBSEQUENT_TOC_PAGES: 20,
  
  // Preview window dimensions
  PREVIEW_WINDOW_OPTIONS: 'width=1000,height=800,scrollbars=yes,resizable=yes',
  
  // Print dialog delay
  PRINT_DIALOG_DELAY: 500,
  
  // Window titles
  WINDOW_TITLES: {
    preview: (type: string) => `Policy Manual Preview - ${type}`,
    print: (type: string) => `Recovery Point West Virginia ${type} Policy Manual`
  },
  
  // Organization info
  ORGANIZATION: {
    name: 'Recovery Point West Virginia',
    address: '1007 Washington Street East, Charleston, WV 25301',
    website: 'www.recoverypointwv.com'
  },
  
  // Logo path
  LOGO_PATH: '/lovable-uploads/07b7c8f7-302d-4fa4-add8-69e1b84285ac.png'
} as const;
