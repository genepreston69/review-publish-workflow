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
    const totalPages = 2 + policies.length; // Cover + TOC + policies
    
    // Generate Table of Contents entries
    let tocRows = '';
    let currentPage = 3; // Start after cover page and TOC
    
    policies.forEach((policy) => {
      const policyTitle = policy.name || 'Untitled Policy';
      const policyNumber = policy.policy_number || 'N/A';
      
      tocRows += `
        <tr class="toc-row">
          <td class="toc-number">
            <a href="#policy-${policy.id}" class="toc-link">${policyNumber}</a>
          </td>
          <td class="toc-title">
            <a href="#policy-${policy.id}" class="toc-link">${policyTitle}</a>
          </td>
          <td class="toc-page">
            <a href="#policy-${policy.id}" class="toc-link">${currentPage}</a>
          </td>
        </tr>
      `;
      currentPage++;
    });

    // Generate Policy Content
    let policyContent = '';
    let pageNumber = 3;
    policies.forEach((policy) => {
      policyContent += `
        <div class="policy-page" id="policy-${policy.id}">
          <div class="page-header">
            <div class="header-content">
              <img src="/lovable-uploads/07b7c8f7-302d-4fa4-add8-69e1b84285ac.png" alt="Recovery Point West Virginia Logo" class="header-logo">
              <span class="header-text">Recovery Point West Virginia ${type} Policy Manual</span>
            </div>
          </div>
          
          <div class="policy-content">
            <div class="policy-title-section">
              <h1 class="policy-title">${policy.name || 'Untitled Policy'}</h1>
              <div class="policy-divider"></div>
            </div>
            
            <div class="policy-metadata-box">
              <div class="metadata-grid">
                <div class="metadata-item">
                  <span class="metadata-label">Policy Number:</span>
                  <span class="metadata-value">${policy.policy_number || 'Not Assigned'}</span>
                </div>
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
                <h2 class="section-title">PURPOSE</h2>
                <div class="section-content">${policy.purpose}</div>
              </div>
            ` : ''}

            ${policy.policy_text ? `
              <div class="policy-section">
                <h2 class="section-title">POLICY</h2>
                <div class="section-content">${policy.policy_text}</div>
              </div>
            ` : ''}

            ${policy.procedure ? `
              <div class="policy-section">
                <h2 class="section-title">PROCEDURE</h2>
                <div class="section-content">${policy.procedure}</div>
              </div>
            ` : ''}
          </div>

          <div class="page-footer">
            <span class="page-number">Page ${pageNumber} of ${totalPages}</span>
          </div>
        </div>
      `;
      pageNumber++;
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
              
              .policy-page, .toc-page, .cover-page {
                page-break-before: always;
                position: relative;
                min-height: 9.5in;
              }
              
              .cover-page {
                page-break-before: avoid;
              }
              
              .policy-section {
                page-break-inside: avoid;
              }

              .page-header {
                page-break-inside: avoid;
              }
              
              .toc-table {
                page-break-inside: auto;
              }

              .toc-row {
                page-break-inside: avoid;
              }
            }
            
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
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
              justify-content: space-between;
              height: 100vh;
              text-align: center;
              padding: 2in 1in;
            }
            
            .cover-logo {
              width: 300px;
              height: auto;
              margin: 0 auto 1.5in auto;
              max-width: 100%;
            }
            
            .cover-title {
              font-size: 32pt;
              font-weight: bold;
              margin-bottom: 0.5in;
              color: #1565c0;
              text-transform: uppercase;
              letter-spacing: 2px;
              line-height: 1.1;
            }
            
            .cover-subtitle {
              font-size: 18pt;
              margin-bottom: 1.5in;
              color: #333;
              font-weight: 500;
            }
            
            .cover-bottom {
              margin-top: auto;
            }
            
            .compilation-date {
              font-size: 14pt;
              color: #666;
              font-weight: bold;
              margin-bottom: 0.3in;
            }

            .organization-info {
              font-size: 12pt;
              color: #666;
              line-height: 1.4;
            }
            
            /* Page Header Styles */
            .page-header {
              border-bottom: 1px solid #ddd;
              padding-bottom: 12px;
              margin-bottom: 24px;
            }

            .header-content {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              gap: 15px;
            }

            .header-logo {
              height: 30px;
              width: auto;
            }

            .header-text {
              font-size: 10pt;
              font-weight: 600;
              color: #1565c0;
            }

            /* Page Footer Styles */
            .page-footer {
              position: absolute;
              bottom: 0.75in;
              right: 0;
              width: 100%;
              text-align: right;
            }
            
            .page-number {
              font-size: 10pt;
              color: #666;
              font-weight: 500;
            }
            
            /* Table of Contents Styles */
            .toc-page {
              padding: 0;
              position: relative;
              min-height: 9.5in;
            }
            
            .toc-title {
              font-size: 24pt;
              font-weight: bold;
              text-align: center;
              margin: 0 0 1in 0;
              color: #1565c0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .toc-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1in;
              font-size: 12pt;
              table-layout: fixed;
            }
            
            .toc-table th {
              background-color: #f8f9fa;
              padding: 16px 12px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #dee2e6;
              color: #1565c0;
              font-size: 12pt;
            }

            .toc-table th:first-child {
              width: 20%;
              text-align: left;
            }

            .toc-table th:nth-child(2) {
              width: 65%;
              text-align: left;
            }

            .toc-table th:last-child {
              width: 15%;
              text-align: right;
            }
            
            .toc-table td {
              padding: 12px;
              border: 1px solid #dee2e6;
              vertical-align: top;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }

            .toc-row:nth-child(even) {
              background-color: #f8f9fa;
            }
            
            .toc-number {
              width: 20%;
              font-weight: bold;
              color: #1565c0;
              font-family: 'Courier New', monospace;
              text-align: left;
              padding-left: 12px;
            }
            
            .toc-title {
              width: 65%;
              text-align: left;
              padding-left: 12px;
              padding-right: 12px;
            }
            
            .toc-page {
              width: 15%;
              text-align: right;
              font-weight: bold;
              padding-right: 12px;
            }
            
            .toc-link {
              text-decoration: none;
              color: inherit;
              display: block;
              width: 100%;
            }
            
            .toc-link:hover {
              color: #1565c0;
              text-decoration: underline;
            }
            
            /* Policy Page Styles */
            .policy-page {
              padding: 0;
              position: relative;
              min-height: 9.5in;
            }
            
            .policy-content {
              margin-bottom: 80px; /* Space for footer */
            }
            
            .policy-title-section {
              margin-bottom: 30px;
            }
            
            .policy-title {
              font-size: 22pt;
              font-weight: bold;
              margin: 0;
              color: #1565c0;
              text-transform: uppercase;
              letter-spacing: 1px;
              line-height: 1.2;
            }
            
            .policy-divider {
              height: 2px;
              background-color: #1565c0;
              margin: 15px 0 0 0;
            }
            
            .policy-metadata-box {
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-left: 4px solid #1565c0;
              padding: 20px;
              margin: 0 0 30px 0;
            }

            .metadata-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }

            .metadata-item {
              display: flex;
              align-items: flex-start;
            }

            .metadata-label {
              font-weight: bold;
              color: #1565c0;
              width: 100px;
              flex-shrink: 0;
              font-size: 10pt;
            }

            .metadata-value {
              color: #333;
              font-size: 11pt;
              flex: 1;
              margin-left: 10px;
            }
            
            .policy-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            
            .section-title {
              font-size: 14pt;
              font-weight: bold;
              margin: 0 0 15px 0;
              color: #1565c0;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid #1565c0;
              padding-bottom: 6px;
            }
            
            .section-content {
              line-height: 1.5;
              text-align: justify;
              font-size: 12pt;
            }
            
            .section-content p {
              margin-bottom: 12px;
            }
            
            .section-content ul, .section-content ol {
              margin: 12px 0 12px 20px;
              padding: 0;
            }
            
            .section-content li {
              margin-bottom: 6px;
              line-height: 1.4;
            }
            
            .section-content h1, .section-content h2, .section-content h3 {
              color: #1565c0;
              margin: 20px 0 12px 0;
              font-weight: bold;
              text-transform: uppercase;
            }

            .section-content h1 {
              font-size: 14pt;
            }

            .section-content h2 {
              font-size: 13pt;
            }

            .section-content h3 {
              font-size: 12pt;
            }
            
            @media screen {
              body {
                padding: 20px;
                max-width: 8.5in;
                margin: 0 auto;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }

              .page-footer {
                position: relative;
                bottom: auto;
                text-align: right;
                margin-top: 20px;
              }
              
              .policy-content {
                margin-bottom: 20px;
              }
            }
          </style>
        </head>
        <body>
          <!-- Cover Page -->
          <div class="cover-page">
            <div>
              <img src="/lovable-uploads/07b7c8f7-302d-4fa4-add8-69e1b84285ac.png" alt="Recovery Point West Virginia Logo" class="cover-logo">
              <h1 class="cover-title">${manualTitle}</h1>
              <p class="cover-subtitle">Comprehensive Policy Collection</p>
            </div>
            <div class="cover-bottom">
              <p class="compilation-date">Compiled on ${compilationDate}</p>
              <div class="organization-info">
                Recovery Point West Virginia<br>
                1007 Washington Street East, Charleston, WV 25301<br>
                www.recoverypointwv.com
              </div>
            </div>
          </div>

          <!-- Table of Contents -->
          <div class="toc-page">
            <div class="page-header">
              <div class="header-content">
                <img src="/lovable-uploads/07b7c8f7-302d-4fa4-add8-69e1b84285ac.png" alt="Recovery Point West Virginia Logo" class="header-logo">
                <span class="header-text">Recovery Point West Virginia ${type} Policy Manual</span>
              </div>
            </div>
            
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
                ${tocRows}
              </tbody>
            </table>

            <div class="page-footer">
              <span class="page-number">Page 2 of ${totalPages}</span>
            </div>
          </div>

          <!-- Policy Content -->
          ${policyContent}
        </body>
      </html>
    `;
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
              Generate a professional HR policy manual with official Recovery Point West Virginia branding, 
              cover page, table of contents, and board-ready formatting.
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
              Generate a professional facility policy manual with official Recovery Point West Virginia branding, 
              cover page, table of contents, and board-ready formatting.
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
            <h4 className="font-medium text-gray-900">Professional Features:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Official Recovery Point West Virginia logo and branding</li>
              <li>Professional cover page with complete organization details</li>
              <li>Single-page table of contents with clickable policy links</li>
              <li>Consistent headers with logo and manual title</li>
              <li>Clean footers with proper page numbering</li>
              <li>Board-ready formatting with professional typography</li>
              <li>Each policy on separate page with enhanced metadata</li>
              <li>Print-optimized layout with proper page breaks</li>
              <li>Professional color scheme and visual hierarchy</li>
              <li>All-caps section headers (PURPOSE, POLICY, PROCEDURE)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
