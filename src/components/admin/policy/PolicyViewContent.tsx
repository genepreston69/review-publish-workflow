
import { stripHtml } from './policyUtils';

interface Policy {
  name: string | null;
  purpose: string | null;
  policy_text: string | null;
  procedure: string | null;
}

interface PolicyViewContentProps {
  policy: Policy;
}

export function PolicyViewContent({ policy }: PolicyViewContentProps) {
  // Helper function to safely render HTML content
  const renderHtmlContent = (content: string | null): JSX.Element | null => {
    if (!content) return null;
    
    // Always render as HTML to preserve formatting
    return (
      <div 
        className="prose prose-sm max-w-none prose-headings:text-blue-600 prose-headings:font-bold prose-headings:uppercase prose-p:text-gray-800 prose-li:text-gray-800 prose-ul:list-disc prose-ol:list-decimal"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  };

  return (
    <div className="space-y-8 mt-6">
      {/* Policy Name */}
      {policy.name && (
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 uppercase tracking-wide">
            {stripHtml(policy.name)}
          </h1>
        </div>
      )}

      {/* Purpose Section */}
      {policy.purpose && (
        <div className="policy-section">
          <h2 className="text-lg font-bold mb-4 text-blue-600 uppercase tracking-wide border-b border-blue-600 pb-2">
            PURPOSE
          </h2>
          <div className="text-justify leading-relaxed text-gray-800 policy-content">
            {renderHtmlContent(policy.purpose)}
          </div>
        </div>
      )}

      {/* Policy Text Section */}
      {policy.policy_text && (
        <div className="policy-section">
          <h2 className="text-lg font-bold mb-4 text-blue-600 uppercase tracking-wide border-b border-blue-600 pb-2">
            POLICY
          </h2>
          <div className="text-justify leading-relaxed text-gray-800 policy-content">
            {renderHtmlContent(policy.policy_text)}
          </div>
        </div>
      )}

      {/* Procedure Section */}
      {policy.procedure && (
        <div className="policy-section">
          <h2 className="text-lg font-bold mb-4 text-blue-600 uppercase tracking-wide border-b border-blue-600 pb-2">
            PROCEDURE
          </h2>
          <div className="text-justify leading-relaxed text-gray-800 policy-content">
            {renderHtmlContent(policy.procedure)}
          </div>
        </div>
      )}

      <style>{`
        .policy-section {
          page-break-inside: avoid;
        }
        
        .policy-content .prose {
          color: inherit;
        }
        
        .policy-content .prose h1, 
        .policy-content .prose h2, 
        .policy-content .prose h3 {
          color: #1565c0 !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          margin: 20px 0 12px 0 !important;
        }

        .policy-content .prose h1 {
          font-size: 14pt !important;
        }

        .policy-content .prose h2 {
          font-size: 13pt !important;
        }

        .policy-content .prose h3 {
          font-size: 12pt !important;
        }

        .policy-content .prose p {
          margin-bottom: 12px !important;
          line-height: 1.5 !important;
          color: #374151 !important;
          text-align: justify !important;
        }
        
        .policy-content .prose ul {
          margin: 12px 0 12px 20px !important;
          padding: 0 !important;
          list-style-type: disc !important;
        }
        
        .policy-content .prose ol {
          margin: 12px 0 12px 20px !important;
          padding: 0 !important;
          list-style-type: decimal !important;
        }
        
        .policy-content .prose li {
          margin-bottom: 6px !important;
          line-height: 1.4 !important;
          color: #374151 !important;
          text-align: justify !important;
        }

        .policy-content .prose strong {
          font-weight: 600 !important;
          color: #374151 !important;
        }

        .policy-content .prose em {
          font-style: italic !important;
          color: #374151 !important;
        }

        /* Ensure bullet points and numbers are visible */
        .policy-content .prose ul li::marker {
          color: #374151 !important;
        }

        .policy-content .prose ol li::marker {
          color: #374151 !important;
        }
      `}</style>
    </div>
  );
}
