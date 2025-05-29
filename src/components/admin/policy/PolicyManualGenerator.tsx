
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ManualGenerationService } from './manualGenerationService';
import { ManualCard } from './ManualCard';
import { ManualFeaturesList } from './ManualFeaturesList';

interface PolicyManualGeneratorProps {}

export function PolicyManualGenerator({}: PolicyManualGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateManual = async (type: 'HR' | 'Facility') => {
    try {
      setIsGenerating(true);
      
      const result = await ManualGenerationService.generatePrintableManual(type);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${type} Policy Manual generated successfully. Print dialog will open automatically.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: result.error?.includes('No published') ? "No Policies Found" : "Error",
          description: result.error,
        });
      }

    } catch (error) {
      console.error('Error generating manual:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to generate ${type} policy manual.`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const previewManual = async (type: 'HR' | 'Facility') => {
    try {
      setIsGenerating(true);
      
      const result = await ManualGenerationService.generatePreviewManual(type);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${type} Policy Manual preview opened. Use the controls in the top-right to print or save.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: result.error?.includes('No published') ? "No Policies Found" : "Error",
          description: result.error,
        });
      }

    } catch (error) {
      console.error('Error previewing manual:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to preview ${type} policy manual.`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Policy Manual Generator</h2>
        <p className="text-muted-foreground">
          Generate professional, board-ready policy manuals with official branding
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ManualCard 
          type="HR" 
          isGenerating={isGenerating} 
          onGenerate={generateManual}
          onPreview={previewManual}
        />
        <ManualCard 
          type="Facility" 
          isGenerating={isGenerating} 
          onGenerate={generateManual}
          onPreview={previewManual}
        />
      </div>

      <ManualFeaturesList />
    </div>
  );
}
