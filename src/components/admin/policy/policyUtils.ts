
// Function to strip HTML tags from text and properly format TipTap content
export const stripHtml = (html: string | null): string => {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content and clean up extra whitespace
  let textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up multiple spaces and line breaks
  textContent = textContent.replace(/\s+/g, ' ').trim();
  
  // If we still have JSON-like content, try to extract text from it
  if (textContent.includes('"type":') && textContent.includes('"content":')) {
    try {
      // Try to parse as JSON and extract text content
      const parsed = JSON.parse(html);
      textContent = extractTextFromTipTapJson(parsed);
    } catch (e) {
      // If JSON parsing fails, use regex to extract text values
      const textMatches = html.match(/"text":"([^"]+)"/g);
      if (textMatches) {
        textContent = textMatches
          .map(match => match.replace(/"text":"([^"]+)"/, '$1'))
          .join(' ');
      }
    }
  }
  
  return textContent;
};

// Helper function to recursively extract text from TipTap JSON structure
const extractTextFromTipTapJson = (node: any): string => {
  if (!node) return '';
  
  let text = '';
  
  // If this node has text content, add it
  if (node.text) {
    text += node.text;
  }
  
  // If this node has content (children), recursively process them
  if (node.content && Array.isArray(node.content)) {
    text += node.content.map(extractTextFromTipTapJson).join(' ');
  }
  
  return text;
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
