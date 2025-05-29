
export function generateChangeId(): string {
  return crypto.randomUUID();
}

export function getUserInitials(name?: string, email?: string): string {
  if (name && name !== email) {
    // Extract initials from full name
    const words = name.trim().split(/\s+/);
    const initials = words
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3);
    return initials || 'U';
  }
  
  if (email) {
    // Extract initials from email username
    const username = email.split('@')[0];
    return username.slice(0, 2).toUpperCase() || 'U';
  }
  
  return 'U'; // Default fallback
}

export function migrateHtmlToJson(htmlContent: string) {
  // This is a simple migration - in practice, you might want to use TipTap's 
  // generateJSON method with your extensions for more accurate conversion
  try {
    // Basic HTML to plain text conversion for migration
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const plainText = doc.body.textContent || '';
    
    // Return a basic TipTap JSON structure
    return {
      type: 'doc',
      content: plainText ? [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: plainText,
            },
          ],
        },
      ] : [],
    };
  } catch (error) {
    console.error('Error migrating HTML to JSON:', error);
    return {
      type: 'doc',
      content: [],
    };
  }
}

export function isValidTipTapJson(content: any): boolean {
  return (
    content &&
    typeof content === 'object' &&
    content.type === 'doc' &&
    Array.isArray(content.content)
  );
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
