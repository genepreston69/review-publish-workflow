
import { stripHtml } from './policyUtils';

interface Policy {
  purpose: string | null;
  policy_text: string | null;
  procedure: string | null;
}

interface PolicyViewContentProps {
  policy: Policy;
}

export function PolicyViewContent({ policy }: PolicyViewContentProps) {
  return (
    <div className="space-y-8 mt-6">
      {/* Purpose Section */}
      {policy.purpose && (
        <div className="policy-section">
          <h2 className="text-lg font-bold mb-4 text-blue-600 uppercase tracking-wide border-b border-blue-600 pb-2">
            PURPOSE
          </h2>
          <div className="text-justify leading-relaxed text-gray-800">
            <div dangerouslySetInnerHTML={{ __html: policy.purpose }} />
          </div>
        </div>
      )}

      {/* Policy Text Section */}
      {policy.policy_text && (
        <div className="policy-section">
          <h2 className="text-lg font-bold mb-4 text-blue-600 uppercase tracking-wide border-b border-blue-600 pb-2">
            POLICY
          </h2>
          <div className="text-justify leading-relaxed text-gray-800">
            <div dangerouslySetInnerHTML={{ __html: policy.policy_text }} />
          </div>
        </div>
      )}

      {/* Procedure Section */}
      {policy.procedure && (
        <div className="policy-section">
          <h2 className="text-lg font-bold mb-4 text-blue-600 uppercase tracking-wide border-b border-blue-600 pb-2">
            PROCEDURE
          </h2>
          <div className="text-justify leading-relaxed text-gray-800">
            <div dangerouslySetInnerHTML={{ __html: policy.procedure }} />
          </div>
        </div>
      )}

      <style jsx>{`
        .policy-section {
          page-break-inside: avoid;
        }
        
        .policy-section h1, .policy-section h2, .policy-section h3 {
          color: #1565c0 !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          margin: 20px 0 12px 0 !important;
        }

        .policy-section h1 {
          font-size: 14pt !important;
        }

        .policy-section h2 {
          font-size: 13pt !important;
        }

        .policy-section h3 {
          font-size: 12pt !important;
        }

        .policy-section p {
          margin-bottom: 12px !important;
          line-height: 1.5 !important;
        }
        
        .policy-section ul, .policy-section ol {
          margin: 12px 0 12px 20px !important;
          padding: 0 !important;
        }
        
        .policy-section li {
          margin-bottom: 6px !important;
          line-height: 1.4 !important;
        }
      `}</style>
    </div>
  );
}
