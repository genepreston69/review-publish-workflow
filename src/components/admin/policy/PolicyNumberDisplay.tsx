
import { FileText } from 'lucide-react';

interface PolicyNumberDisplayProps {
  policyNumber: string;
}

export function PolicyNumberDisplay({ policyNumber }: PolicyNumberDisplayProps) {
  if (!policyNumber) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        <div>
          <p className="font-medium text-blue-900">Generated Policy Number</p>
          <p className="text-blue-700 font-mono text-lg">{policyNumber}</p>
        </div>
      </div>
    </div>
  );
}
