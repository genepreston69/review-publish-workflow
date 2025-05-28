import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Trash2, Eye, RotateCcw, Printer } from 'lucide-react';

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

interface FacilityPolicyCardProps {
  policy: Policy;
  isEditor: boolean;
  canPublish: boolean;
  isSuperAdmin: boolean;
  onView: (policyId: string) => void;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onDelete: (policyId: string) => void;
}

// Function to strip HTML tags from text
const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const getStatusColor = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'under-review':
    case 'under review':
      return 'bg-blue-100 text-blue-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const handlePrintPolicy = (policy: Policy) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const currentDate = new Date();
  const printDateTime = `${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${policy.name || 'Policy'} - Recovery Point West Virginia</title>
        <style>
          @media print {
            @page {
              margin: 1in;
              size: letter;
            }
            
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 11pt;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 0 0 40px 0;
            background: white;
          }
          
          .compact-header {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            padding-bottom: 15px;
            margin-bottom: 20px;
            border-bottom: 2px solid #2563eb;
            page-break-inside: avoid;
          }
          
          .logo-section {
            flex-shrink: 0;
          }
          
          .logo {
            max-width: 120px;
            max-height: 60px;
            display: block;
          }
          
          .company-name {
            font-size: 14pt;
            font-weight: bold;
            color: #2563eb;
            margin: 5px 0 0 0;
            text-align: center;
          }
          
          .header-content {
            flex: 1;
            min-width: 0;
          }
          
          .policy-title {
            font-size: 18pt;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #333;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .metadata-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 20px;
            font-size: 10pt;
            margin-top: 10px;
          }
          
          .metadata-item {
            display: flex;
            align-items: center;
          }
          
          .metadata-label {
            font-weight: bold;
            color: #1565c0;
            margin-right: 8px;
            min-width: 80px;
          }
          
          .metadata-value {
            color: #333;
          }
          
          .section {
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 13pt;
            font-weight: bold;
            margin: 15px 0 8px 0;
            color: #1565c0;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #2563eb;
            padding-bottom: 3px;
          }
          
          .section-content {
            margin-top: 8px;
            line-height: 1.3;
          }
          
          .section-content p {
            margin-bottom: 8px;
            text-align: justify;
          }
          
          .section-content ul, .section-content ol {
            margin: 8px 0 8px 25px;
            padding: 0;
          }
          
          .section-content li {
            margin-bottom: 4px;
            line-height: 1.4;
          }
          
          .section-content h1, .section-content h2, .section-content h3 {
            color: #1565c0;
            margin: 15px 0 8px 0;
            font-weight: bold;
          }
          
          .section-content h1 {
            font-size: 12pt;
          }
          
          .section-content h2 {
            font-size: 11.5pt;
          }
          
          .section-content h3 {
            font-size: 11pt;
          }
          
          .footer {
            position: fixed;
            bottom: 0.5in;
            left: 1in;
            right: 1in;
            height: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9pt;
            color: #666;
            border-top: 1px solid #dee2e6;
            padding-top: 8px;
            background: white;
            white-space: nowrap;
          }
          
          .footer-left {
            font-weight: bold;
            color: #333;
          }
          
          .footer-right {
            font-style: italic;
            color: #666;
          }
          
          @media print {
            .footer {
              position: fixed;
              bottom: 0;
            }
            
            body {
              padding-bottom: 50px;
            }
          }
          
          @media screen {
            body {
              padding: 20px;
              max-width: 8.5in;
              margin: 0 auto;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
          }
        </style>
      </head>
      <body>
        <div class="compact-header">
          <div class="logo-section">
            <img src="/lovable-uploads/acf8d05c-3cb0-46eb-841c-b50ed425544d.png" alt="Recovery Point West Virginia Logo" class="logo" />
            <div class="company-name">Recovery Point West Virginia</div>
          </div>
          
          <div class="header-content">
            <div class="policy-title">${policy.name || 'Untitled Policy'}</div>
            
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
        </div>
        
        ${policy.purpose ? `
          <div class="section">
            <div class="section-title">Purpose</div>
            <div class="section-content">${policy.purpose}</div>
          </div>
        ` : ''}
        
        ${policy.policy_text ? `
          <div class="section">
            <div class="section-title">Policy</div>
            <div class="section-content">${policy.policy_text}</div>
          </div>
        ` : ''}
        
        ${policy.procedure ? `
          <div class="section">
            <div class="section-title">Procedure</div>
            <div class="section-content">${policy.procedure}</div>
          </div>
        ` : ''}
        
        <div class="footer">
          <div class="footer-left">Page 1 of 1</div>
          <div class="footer-right">Printed on ${printDateTime}</div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Wait for content and images to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

export function FacilityPolicyCard({ 
  policy, 
  isEditor, 
  canPublish, 
  isSuperAdmin, 
  onView, 
  onUpdateStatus, 
  onDelete 
}: FacilityPolicyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {policy.name || 'Untitled Policy'}
            </CardTitle>
            {policy.policy_number && (
              <CardDescription className="font-mono text-sm">
                {policy.policy_number}
              </CardDescription>
            )}
          </div>
          {policy.status && (
            <Badge 
              variant="secondary" 
              className={getStatusColor(policy.status)}
            >
              {policy.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-grow">
        {/* Main content area that flexes to fill space */}
        <div className="flex-grow space-y-3">
          {policy.purpose && (
            <div>
              <h4 className="font-medium text-sm text-gray-700">Purpose</h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {stripHtml(policy.purpose)}
              </p>
            </div>
          )}
          
          {policy.procedure && (
            <div>
              <h4 className="font-medium text-sm text-gray-700">Procedure</h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {stripHtml(policy.procedure)}
              </p>
            </div>
          )}
        </div>

        {/* User/date row - consistently positioned at bottom of content area */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 mt-4">
          {policy.reviewer && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{stripHtml(policy.reviewer)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(policy.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action buttons - arranged in 2x2 grid */}
        <div className="pt-3 border-t mt-auto">
          {/* First row: View and Print buttons */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(policy.id)}
              className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <Eye className="w-3 h-3 mr-1" />
              View Policy
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePrintPolicy(policy)}
              className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <Printer className="w-3 h-3 mr-1" />
              Print Policy
            </Button>
          </div>

          {/* Second row: Update and Delete buttons (conditionally rendered) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Update Policy Button - Show for users with edit/publish permissions */}
            {(isEditor || canPublish) ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(policy.id, 'draft')}
                className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Update Policy
              </Button>
            ) : (
              <div></div>
            )}

            {/* Super Admin Delete Action */}
            {isSuperAdmin ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(policy.id)}
                className="text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete Policy
              </Button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
