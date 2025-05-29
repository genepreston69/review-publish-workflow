
// Function to strip HTML tags from text
export const stripHtml = (html: string | null): string => {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content and clean up extra whitespace
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  return textContent.replace(/\s+/g, ' ').trim();
};

export const getStatusColor = (status: string | null) => {
  const cleanStatus = stripHtml(status);
  switch (cleanStatus?.toLowerCase()) {
    case 'active':
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'under-review':
    case 'under review':
      return 'bg-blue-100 text-blue-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
