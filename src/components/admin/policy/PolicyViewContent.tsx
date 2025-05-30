
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
    <div className="space-y-6 mt-6">
      {/* Purpose Section */}
      {policy.purpose && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Purpose</h3>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{stripHtml(policy.purpose)}</p>
          </div>
        </div>
      )}

      {/* Policy Text Section */}
      {policy.policy_text && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Policy</h3>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{stripHtml(policy.policy_text)}</p>
          </div>
        </div>
      )}

      {/* Procedure Section */}
      {policy.procedure && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Procedure</h3>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{stripHtml(policy.procedure)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
