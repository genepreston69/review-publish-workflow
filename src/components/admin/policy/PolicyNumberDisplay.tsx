
import { FileText } from 'lucide-react';

interface PolicyNumberDisplayProps {
  policyNumber: string;
}

export function PolicyNumberDisplay({ policyNumber }: PolicyNumberDisplayProps) {
  if (!policyNumber) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900">Generated Policy Number:</span>
          <span className="text-blue-700 font-mono text-sm">{policyNumber}</span>
        </div>
      </div>
    </div>
  );
}
