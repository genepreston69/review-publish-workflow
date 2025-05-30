
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
  // Helper function to format text content with proper paragraphs
  const formatTextContent = (content: string | null): string => {
    if (!content) return '';
    
    const cleanText = stripHtml(content);
    // Split by common sentence endings and rejoin with proper spacing
    return cleanText.replace(/\.\s+/g, '. ').trim();
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
            <p className="whitespace-pre-wrap">{formatTextContent(policy.purpose)}</p>
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
            <p className="whitespace-pre-wrap">{formatTextContent(policy.policy_text)}</p>
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
            <p className="whitespace-pre-wrap">{formatTextContent(policy.procedure)}</p>
          </div>
        </div>
      )}

      <style>{`
        .policy-section {
          page-break-inside: avoid;
        }
        
        .policy-content h1, 
        .policy-content h2, 
        .policy-content h3 {
          color: #1565c0 !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          margin: 20px 0 12px 0 !important;
        }

        .policy-content h1 {
          font-size: 14pt !important;
        }

        .policy-content h2 {
          font-size: 13pt !important;
        }

        .policy-content h3 {
          font-size: 12pt !important;
        }

        .policy-content p {
          margin-bottom: 12px !important;
          line-height: 1.5 !important;
        }
        
        .policy-content ul, 
        .policy-content ol {
          margin: 12px 0 12px 20px !important;
          padding: 0 !important;
        }
        
        .policy-content li {
          margin-bottom: 6px !important;
          line-height: 1.4 !important;
        }
      `}</style>
    </div>
  );
}
