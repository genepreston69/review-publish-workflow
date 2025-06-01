import { isValidTipTapJson } from '@/utils/trackingUtils';

// Enhanced HTML stripping function - preserve line breaks and spacing
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Convert <br> and <p> tags to line breaks before stripping
  let cleanText = html.replace(/<br\s*\/?>/gi, '\n');
  cleanText = cleanText.replace(/<\/p>/gi, '\n');
  cleanText = cleanText.replace(/<p[^>]*>/gi, '');
  
  // Remove remaining HTML tags
  cleanText = cleanText.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanText;
  cleanText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Don't collapse any whitespace - preserve exactly as entered
  return cleanText;
};

// Convert TipTap JSON to HTML to preserve formatting
export const extractHtmlFromJson = (jsonContent: any): string => {
  if (!jsonContent || typeof jsonContent !== 'object') return '';
  
  if (jsonContent.type === 'text') {
    return jsonContent.text || '';
  }
  
  if (jsonContent.type === 'paragraph') {
    const content = jsonContent.content ? jsonContent.content.map(extractHtmlFromJson).join('') : '';
    return `<p>${content}</p>`;
  }
  
  if (jsonContent.type === 'hardBreak') {
    return '<br>';
  }
  
  if (jsonContent.content && Array.isArray(jsonContent.content)) {
    return jsonContent.content.map(extractHtmlFromJson).join('');
  }
  
  return '';
};

// Convert TipTap JSON to plain text with proper spacing and line breaks
export const extractTextFromJson = (jsonContent: any): string => {
  if (!jsonContent || typeof jsonContent !== 'object') return '';
  
  if (jsonContent.type === 'text') {
    return jsonContent.text || '';
  }
  
  if (jsonContent.type === 'paragraph') {
    const content = jsonContent.content ? jsonContent.content.map(extractTextFromJson).join('') : '';
    return content + '\n';
  }
  
  if (jsonContent.type === 'hardBreak') {
    return '\n';
  }
  
  if (jsonContent.content && Array.isArray(jsonContent.content)) {
    return jsonContent.content.map(extractTextFromJson).join('');
  }
  
  return '';
};

// Process content for display - keep as HTML to preserve formatting
export const processContentForDisplay = (content: string): string => {
  if (!content) return '';
  
  console.log('Processing display content:', content);
  
  // Try to extract from JSON first
  try {
    const parsed = JSON.parse(content);
    if (isValidTipTapJson(parsed)) {
      const htmlContent = extractHtmlFromJson(parsed);
      console.log('Extracted HTML from JSON:', htmlContent);
      return htmlContent;
    }
  } catch {
    // Not JSON, continue
  }
  
  // If content already contains HTML, return as-is
  if (content.includes('<') && content.includes('>')) {
    console.log('Content is already HTML, returning as-is:', content);
    return content;
  }
  
  // Convert plain text to HTML paragraphs, preserving line breaks
  const lines = content.split('\n');
  const htmlContent = lines.map(line => {
    if (line.trim() === '') {
      return '<p></p>';
    }
    return `<p>${line}</p>`;
  }).join('');
  
  console.log('Converted plain text to HTML:', htmlContent);
  return htmlContent;
};

// Determine if content is in JSON mode
export const determineJsonMode = (content: string): boolean => {
  if (!content) return false;
  
  try {
    const parsed = JSON.parse(content);
    if (isValidTipTapJson(parsed)) {
      return true;
    }
  } catch {
    // Not JSON
  }
  
  if (content.includes('<') && content.includes('>')) {
    return true;
  }
  
  return false;
};
