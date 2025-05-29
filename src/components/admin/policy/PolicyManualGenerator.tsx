
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

  const previewManual = async (type: 'HR' | 'Facility') => {
    try {
      setIsGenerating(true);
      const prefix = type === 'HR' ? 'HR' : 'RP';
      const policies = await fetchPoliciesByPrefix(prefix);

      if (policies.length === 0) {
        toast({
          variant: "destructive",
          title: "No Policies Found",
          description: `No published ${type} policies found to preview manual.`,
        });
        return;
      }

      // Create a new window for preview
      const previewWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
      if (!previewWindow) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to open preview window. Please check your popup blocker.",
        });
        return;
      }

      const currentDate = new Date();
      const compilationDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Generate the manual HTML with additional controls
      const manualHtml = generateManualHTML(type, policies, compilationDate);
      
      // Add preview controls to the HTML
      const previewHtmlWithControls = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Policy Manual Preview - ${type}</title>
            <style>
              .preview-controls {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 1000;
                background: white;
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border: 1px solid #e5e7eb;
              }
              .preview-controls button {
                margin: 0 5px;
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                font-size: 14px;
              }
              .preview-controls button:hover {
                background: #f3f4f6;
              }
              .preview-controls .print-btn {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
              }
              .preview-controls .print-btn:hover {
                background: #2563eb;
              }
              .preview-controls .save-btn {
                background: #10b981;
                color: white;
                border-color: #10b981;
              }
              .preview-controls .save-btn:hover {
                background: #059669;
              }
              @media print {
                .preview-controls {
                  display: none !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="preview-controls">
              <button onclick="window.print()" class="print-btn">🖨️ Print</button>
              <button onclick="saveAsPDF()" class="save-btn">💾 Save as PDF</button>
              <button onclick="window.close()">✕ Close</button>
            </div>
            ${manualHtml.replace('<!DOCTYPE html><html><head>', '').replace('</head><body>', '').replace('</body></html>', '')}
            <script>
              function saveAsPDF() {
                // Use the browser's print dialog with "Save as PDF" option
                alert('Use your browser\\'s Print dialog and select "Save as PDF" as the destination to save this manual.');
                window.print();
              }
            </script>
          </body>
        </html>
      `;
      
      previewWindow.document.write(previewHtmlWithControls);
      previewWindow.document.close();

      toast({
        title: "Success",
        description: `${type} Policy Manual preview opened. Use the controls in the top-right to print or save.`,
      });

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
