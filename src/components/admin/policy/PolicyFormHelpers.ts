
// Helper functions for handling text conversion between HTML and plain text
export const extractPlainText = (htmlContent: string): string => {
  if (!htmlContent) return '';
  
  // Create a temporary DOM element to extract text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  return tempDiv.textContent || tempDiv.innerText || '';
};

export const convertTextToHtml = (plainText: string): string => {
  if (!plainText) return '';
  
  // Convert line breaks to paragraphs and preserve formatting
  const paragraphs = plainText.split('\n\n').filter(p => p.trim());
  if (paragraphs.length === 0) return `<p>${plainText}</p>`;
  
  return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
};
