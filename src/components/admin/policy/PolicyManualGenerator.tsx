
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchPoliciesByPrefix, generateManualHTML } from './manualGenerationUtils';
import { ManualCard } from './ManualCard';
import { ManualFeaturesList } from './ManualFeaturesList';

interface PolicyManualGeneratorProps {}

export function PolicyManualGenerator({}: PolicyManualGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateManual = async (type: 'HR' | 'Facility') => {
    try {
      setIsGenerating(true);
      const prefix = type === 'HR' ? 'HR' : 'RP';
      const policies = await fetchPoliciesByPrefix(prefix);

      if (policies.length === 0) {
        toast({
          variant: "destructive",
          title: "No Policies Found",
          description: `No published ${type} policies found to generate manual.`,
        });
        return;
      }

      // Create a new window for the manual
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to open print window. Please check your popup blocker.",
        });
        return;
      }

      const currentDate = new Date();
      const compilationDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Generate the manual HTML
      const manualHtml = generateManualHTML(type, policies, compilationDate);
      
      printWindow.document.write(manualHtml);
      printWindow.document.close();
      
      // Wait for content to load then show print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };

      toast({
        title: "Success",
        description: `${type} Policy Manual generated successfully. Print dialog will open automatically.`,
      });

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
        />
        <ManualCard 
          type="Facility" 
          isGenerating={isGenerating} 
          onGenerate={generateManual} 
        />
      </div>

      <ManualFeaturesList />
    </div>
  );
}
