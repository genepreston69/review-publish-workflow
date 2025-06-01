
import { isValidTipTapJson } from '@/utils/trackingUtils';

// Enhanced HTML stripping function
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Remove HTML tags completely
  let cleanText = html.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanText;
  cleanText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up multiple spaces and line breaks
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText;
};

// Convert TipTap JSON to plain text
export const extractTextFromJson = (jsonContent: any): string => {
  if (!jsonContent || typeof jsonContent !== 'object') return '';
  
  if (jsonContent.type === 'text') {
    return jsonContent.text || '';
  }
  
  if (jsonContent.content && Array.isArray(jsonContent.content)) {
    return jsonContent.content.map(extractTextFromJson).join(' ');
  }
  
  return '';
};

// Process content for display - aggressively strip any HTML
export const processContentForDisplay = (content: string): string => {
  if (!content) return '';
  
  console.log('Processing display content:', content);
  
  // Try to extract from JSON first
  try {
    const parsed = JSON.parse(content);
    if (isValidTipTapJson(parsed)) {
      const plainText = extractTextFromJson(parsed);
      console.log('Extracted from JSON:', plainText);
      return plainText;
    }
  } catch {
    // Not JSON, continue
  }
  
  // If content contains any HTML, strip it completely
  if (content.includes('<') || content.includes('>') || content.includes('&')) {
    const cleanText = stripHtmlTags(content);
    console.log('Stripped HTML:', cleanText);
    return cleanText;
  }
  
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
