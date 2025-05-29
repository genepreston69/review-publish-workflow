
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Building2, Loader2, Eye, Download } from 'lucide-react';

interface ManualCardProps {
  type: 'HR' | 'Facility';
  isGenerating: boolean;
  onGenerate: (type: 'HR' | 'Facility') => void;
  onPreview?: (type: 'HR' | 'Facility') => void;
}

export function ManualCard({ type, isGenerating, onGenerate, onPreview }: ManualCardProps) {
  const isHR = type === 'HR';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isHR ? <Users className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
          {type} Policy Manual
        </CardTitle>
        <CardDescription>
          {isHR 
            ? "Human Resources policies and procedures"
            : "Facility operations and safety policies"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          Includes all published {type.toLowerCase()} policies with official branding
        </div>
        
        <div className="flex gap-2">
          {onPreview && (
            <Button
              onClick={() => onPreview(type)}
              disabled={isGenerating}
              variant="outline"
              className="flex-1"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Preview
            </Button>
          )}
          
          <Button
            onClick={() => onGenerate(type)}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Generate & Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
