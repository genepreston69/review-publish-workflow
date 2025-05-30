
import { FileText } from 'lucide-react';

interface FormNumberDisplayProps {
  formNumber: string;
}

export function FormNumberDisplay({ formNumber }: FormNumberDisplayProps) {
  if (!formNumber) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-2 w-full">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-green-900">Generated Form Number:</span>
          <span className="text-green-700 font-mono text-sm">{formNumber}</span>
        </div>
      </div>
    </div>
  );
}
