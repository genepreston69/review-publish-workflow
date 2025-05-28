
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Printer } from 'lucide-react';

interface ManualCardProps {
  type: 'HR' | 'Facility';
  isGenerating: boolean;
  onGenerate: (type: 'HR' | 'Facility') => void;
}

export function ManualCard({ type, isGenerating, onGenerate }: ManualCardProps) {
  const iconColor = type === 'HR' ? 'text-blue-600' : 'text-green-600';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className={`h-5 w-5 ${iconColor}`} />
          {type} Policy Manual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Generate a professional {type.toLowerCase()} policy manual with official Recovery Point West Virginia branding, 
          cover page, table of contents, and board-ready formatting.
        </p>
        <Button
          onClick={() => onGenerate(type)}
          disabled={isGenerating}
          className="w-full"
        >
          <Printer className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : `Generate ${type} Manual`}
        </Button>
      </CardContent>
    </Card>
  );
}
