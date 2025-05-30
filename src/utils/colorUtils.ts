
/**
 * Removes all color styling from HTML content while preserving other formatting
 */
export const stripColorsFromHtml = (html: string | null): string | null => {
  if (!html) return html;
  
  // Remove inline color styles
  let cleanedHtml = html.replace(/style\s*=\s*["'][^"']*color[^"']*["']/gi, '');
  
  // Remove empty style attributes
  cleanedHtml = cleanedHtml.replace(/style\s*=\s*["']\s*["']/gi, '');
  
  // Remove TipTap color classes and data attributes
  cleanedHtml = cleanedHtml.replace(/class\s*=\s*["'][^"']*color[^"']*["']/gi, '');
  cleanedHtml = cleanedHtml.replace(/data-color\s*=\s*["'][^"']*["']/gi, '');
  
  return cleanedHtml;
};

/**
 * Strips colors from multiple HTML fields in a policy object
 */
export const stripColorsFromPolicyFields = (policy: {
  purpose?: string | null;
  policy_text?: string | null;
  procedure?: string | null;
}) => {
  return {
    ...policy,
    purpose: stripColorsFromHtml(policy.purpose),
    policy_text: stripColorsFromHtml(policy.policy_text),
    procedure: stripColorsFromHtml(policy.procedure),
  };
};
