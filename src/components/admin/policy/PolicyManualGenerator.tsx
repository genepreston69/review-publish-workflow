
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ManualGenerationService } from './manualGenerationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Users, Building, Loader2 } from 'lucide-react';

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

  const features = [
    "Official Recovery Point West Virginia logo and branding",
    "Professional cover page with complete organization details",
    "Single-page table of contents with clickable policy links",
    "Consistent headers with logo and manual title",
    "Clean footers with proper page numbering",
    "Board-ready formatting with professional typography",
    "Each policy on separate page with enhanced metadata",
    "Print-optimized layout with proper page breaks",
    "Professional color scheme and visual hierarchy",
    "All-caps section headers (PURPOSE, POLICY, PROCEDURE)"
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Policy Manual Generator</h1>
        <p className="text-slate-600">Generate professional, board-ready policy manuals with official branding</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* HR Policy Manual Card */}
        <Card className="h-fit border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">
                  HR Policy Manual
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Human Resources policies and procedures
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit text-xs px-3 py-1">
              Includes all published HR policies with official branding
            </Badge>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => previewManual('HR')}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Preview
              </Button>
              <Button 
                size="sm" 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => generateManual('HR')}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Generate & Print
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Facility Policy Manual Card */}
        <Card className="h-fit border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Facility Policy Manual
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Facility operations and safety policies
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit text-xs px-3 py-1">
              Includes all published facility policies with official branding
            </Badge>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => previewManual('Facility')}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Preview
              </Button>
              <Button 
                size="sm" 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => generateManual('Facility')}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Generate & Print
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Features Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">
                Professional Features
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Board-ready formatting and comprehensive documentation
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-slate-700 leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Ready for Board Review</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Generated manuals include all current published policies with professional formatting, 
              official branding, and comprehensive organization details suitable for board presentations 
              and compliance documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
