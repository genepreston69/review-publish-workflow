
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  policy_text: string | null;
  procedure: string | null;
  purpose: string | null;
  reviewer: string | null;
  status: string | null;
  created_at: string;
}

interface PolicyManualGeneratorProps {}

const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export function PolicyManualGenerator({}: PolicyManualGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchPoliciesByPrefix = async (prefix: string): Promise<Policy[]> => {
    const { data, error } = await supabase
      .from('Policies')
      .select('*')
      .eq('status', 'published')
      .ilike('policy_number', `${prefix}%`)
      .order('policy_number', { ascending: true });

    if (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }

    return data || [];
  };

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

  const generateManualHTML = (type: 'HR' | 'Facility', policies: Policy[], compilationDate: string): string => {
    const manualTitle = `Recovery Point West Virginia ${type} Policy Manual`;
    
    // Generate Table of Contents
    let tocEntries = '';
    let currentPage = 3; // Start after cover page and TOC
    
    policies.forEach((policy, index) => {
      tocEntries += `
        <tr>
          <td class="toc-number">${policy.policy_number || 'N/A'}</td>
          <td class="toc-title">
            <a href="#policy-${policy.id}" class="toc-link">
              ${policy.name || 'Untitled Policy'}
            </a>
          </td>
          <td class="toc-page">${currentPage}</td>
        </tr>
      `;
      currentPage++;
    });

    // Generate Policy Content
    let policyContent = '';
    policies.forEach((policy, index) => {
      policyContent += `
        <div class="policy-page" id="policy-${policy.id}">
          <div class="policy-header">
            <h1 class="policy-title">${policy.name || 'Untitled Policy'}</h1>
            <div class="policy-number">Policy Number: ${policy.policy_number || 'Not Assigned'}</div>
          </div>
          
          <div class="policy-metadata">
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="metadata-label">Status:</span>
                <span class="metadata-value">${policy.status || 'Draft'}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Reviewer:</span>
                <span class="metadata-value">${policy.reviewer ? stripHtml(policy.reviewer) : 'Not Assigned'}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Created Date:</span>
                <span class="metadata-value">${new Date(policy.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          ${policy.purpose ? `
            <div class="policy-section">
              <h2 class="section-title">Purpose</h2>
              <div class="section-content">${policy.purpose}</div>
            </div>
          ` : ''}

          ${policy.policy_text ? `
            <div class="policy-section">
              <h2 class="section-title">Policy</h2>
              <div class="section-content">${policy.policy_text}</div>
            </div>
          ` : ''}

          ${policy.procedure ? `
            <div class="policy-section">
              <h2 class="section-title">Procedure</h2>
              <div class="section-content">${policy.procedure}</div>
            </div>
          ` : ''}
        </div>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${manualTitle}</title>
          <style>
            /* Print-optimized styles */
            @media print {
              @page {
                margin: 1in;
                size: letter;
              }
              
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .page-break {
                page-break-before: always;
              }
              
              .policy-page {
                page-break-before: always;
              }
              
              .no-break {
                page-break-inside: avoid;
              }
            }
            
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Times New Roman', 'Georgia', serif;
              font-size: 12pt;
              line-height: 1.4;
              color: #333;
              margin: 0;
              padding: 0;
              background: white;
            }
            
            /* Cover Page Styles */
            .cover-page {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              text-align: center;
              padding: 2in;
            }
            
            .logo-placeholder {
              width: 200px;
              height: 100px;
              border: 2px dashed #ccc;
              margin-bottom: 2in;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #666;
              font-size: 14pt;
            }
            
            .cover-title {
              font-size: 24pt;
              font-weight: bold;
              margin-bottom: 0.5in;
              color: #1565c0;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            
            .cover-subtitle {
              font-size: 18pt;
              margin-bottom: 1in;
              color: #333;
            }
            
            .compilation-date {
              font-size: 14pt;
              color: #666;
              font-style: italic;
            }
            
            /* Table of Contents Styles */
            .toc-page {
              padding: 1in 0;
            }
            
            .toc-title {
              font-size: 20pt;
              font-weight: bold;
              text-align: center;
              margin-bottom: 1in;
              color: #1565c0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .toc-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1in;
            }
            
            .toc-table th {
              background-color: #f5f5f5;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #1565c0;
            }
            
            .toc-table td {
              padding: 8px 12px;
              border-bottom: 1px solid #eee;
            }
            
            .toc-number {
              width: 15%;
              font-weight: bold;
              color: #1565c0;
            }
            
            .toc-title {
              width: 70%;
            }
            
            .toc-page {
              width: 15%;
              text-align: right;
              font-weight: bold;
            }
            
            .toc-link {
              text-decoration: none;
              color: #333;
            }
            
            .toc-link:hover {
              color: #1565c0;
              text-decoration: underline;
            }
            
            /* Policy Page Styles */
            .policy-page {
              padding-top: 0.5in;
            }
            
            .policy-header {
              border-bottom: 3px solid #1565c0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .policy-title {
              font-size: 18pt;
              font-weight: bold;
              margin: 0 0 10px 0;
              color: #1565c0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .policy-number {
              font-size: 14pt;
              font-weight: bold;
              color: #666;
              font-family: 'Courier New', monospace;
            }
            
            .policy-metadata {
              background-color: #f9f9f9;
              padding: 15px;
              margin-bottom: 30px;
              border-left: 4px solid #1565c0;
            }
            
            .metadata-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 15px;
            }
            
            .metadata-item {
              display: flex;
              flex-direction: column;
            }
            
            .metadata-label {
              font-weight: bold;
              color: #1565c0;
              margin-bottom: 5px;
              font-size: 10pt;
              text-transform: uppercase;
            }
            
            .metadata-value {
              color: #333;
              font-size: 11pt;
            }
            
            .policy-section {
              margin-bottom: 30px;
            }
            
            .section-title {
              font-size: 14pt;
              font-weight: bold;
              margin: 0 0 15px 0;
              color: #1565c0;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid #1565c0;
              padding-bottom: 5px;
            }
            
            .section-content {
              line-height: 1.5;
              text-align: justify;
            }
            
            .section-content p {
              margin-bottom: 12px;
            }
            
            .section-content ul, .section-content ol {
              margin: 15px 0 15px 30px;
              padding: 0;
            }
            
            .section-content li {
              margin-bottom: 8px;
              line-height: 1.4;
            }
            
            .section-content h1, .section-content h2, .section-content h3 {
              color: #1565c0;
              margin: 20px 0 10px 0;
              font-weight: bold;
            }
            
            /* Footer for page numbers */
            .page-footer {
              position: fixed;
              bottom: 0.5in;
              left: 1in;
              right: 1in;
              text-align: center;
              font-size: 10pt;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
            
            @media screen {
              body {
                padding: 20px;
                max-width: 8.5in;
                margin: 0 auto;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
            }
          </style>
        </head>
        <body>
          <!-- Cover Page -->
          <div class="cover-page">
            <div class="logo-placeholder">
              [Logo Placeholder]
            </div>
            <h1 class="cover-title">${manualTitle}</h1>
            <p class="cover-subtitle">Comprehensive Policy Collection</p>
            <p class="compilation-date">Compiled on ${compilationDate}</p>
          </div>

          <!-- Table of Contents -->
          <div class="toc-page page-break">
            <h2 class="toc-title">Table of Contents</h2>
            <table class="toc-table">
              <thead>
                <tr>
                  <th>Policy Number</th>
                  <th>Policy Title</th>
                  <th>Page</th>
                </tr>
              </thead>
              <tbody>
                ${tocEntries}
              </tbody>
            </table>
          </div>

          <!-- Policy Content -->
          ${policyContent}

          <!-- Page Footer -->
          <div class="page-footer">
            Recovery Point West Virginia ${type} Policy Manual
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Policy Manual Generator</h2>
        <p className="text-muted-foreground">
          Generate comprehensive policy manuals for HR and Facility policies
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* HR Policy Manual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              HR Policy Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate a comprehensive manual containing all HR policies (HR001, HR002, etc.) with cover page, table of contents, and professional formatting.
            </p>
            <Button
              onClick={() => generateManual('HR')}
              disabled={isGenerating}
              className="w-full"
            >
              <Printer className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate HR Manual'}
            </Button>
          </CardContent>
        </Card>

        {/* Facility Policy Manual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Facility Policy Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate a comprehensive manual containing all Recovery Point policies (RP001, RP002, etc.) with cover page, table of contents, and professional formatting.
            </p>
            <Button
              onClick={() => generateManual('Facility')}
              disabled={isGenerating}
              className="w-full"
            >
              <Printer className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Facility Manual'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <h4 className="font-medium text-gray-900">Instructions:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Each manual includes a professional cover page with Recovery Point West Virginia branding</li>
              <li>Table of contents with clickable links and page numbers</li>
              <li>All policies sorted by policy number with consistent formatting</li>
              <li>Each policy starts on a new page with complete details</li>
              <li>Ready-to-print PDF format using your browser's print function</li>
              <li>Logo placeholder included - replace with actual Recovery Point logo</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
