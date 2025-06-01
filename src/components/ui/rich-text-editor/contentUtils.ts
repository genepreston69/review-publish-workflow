
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
  
  // Preserve spacing - don't collapse multiple spaces or line breaks
  cleanText = cleanText.replace(/\n\s*\n\s*\n/g, '\n\n'); // Only collapse excessive line breaks
  
  return cleanText;
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

// Process content for display - preserve all formatting
export const processContentForDisplay = (content: string): string => {
  if (!content) return '';
  
  console.log('Processing display content:', content);
  
  // Try to extract from JSON first
  try {
    const parsed = JSON.parse(content);
    if (isValidTipTapJson(parsed)) {
      const textWithBreaks = extractTextFromJson(parsed);
      console.log('Extracted from JSON with formatting:', textWithBreaks);
      return textWithBreaks;
    }
  } catch {
    // Not JSON, continue
  }
  
  // If content contains HTML, preserve formatting while cleaning
  if (content.includes('<') || content.includes('>') || content.includes('&')) {
    const cleanText = stripHtmlTags(content);
    console.log('Processed HTML with formatting preserved:', cleanText);
    return cleanText;
  }
  
  // Return content as-is to preserve spacing and formatting
  return content;
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
