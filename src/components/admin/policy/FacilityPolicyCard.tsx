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
              margin: 0.75in;
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
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .header {
            display: flex;
            align-items: center;
            padding-bottom: 20px;
            margin-bottom: 25px;
            border-bottom: 2px solid #2563eb;
          }
          
          .logo {
            max-width: 200px;
            max-height: 60px;
            margin-right: 20px;
          }
          
          .company-info {
            flex: 1;
          }
          
          .company-name {
            font-size: 18pt;
            font-weight: bold;
            color: #2563eb;
            margin: 0;
          }
          
          .company-address {
            font-size: 10pt;
            color: #666;
            margin: 5px 0 0 0;
          }
          
          .policy-title {
            font-size: 20pt;
            font-weight: bold;
            margin: 20px 0 15px 0;
            color: #333;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .metadata-table {
            width: 100%;
            margin: 20px 0 30px 0;
            border-collapse: collapse;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
          }
          
          .metadata-table td {
            padding: 8px 12px;
            border: 1px solid #dee2e6;
            font-size: 10pt;
          }
          
          .metadata-label {
            font-weight: bold;
            background: #e9ecef;
            width: 25%;
            color: #495057;
          }
          
          .metadata-value {
            background: white;
          }
          
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            margin: 25px 0 12px 0;
            color: #2563eb;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #2563eb;
            padding-bottom: 3px;
          }
          
          .section-content {
            margin-left: 0;
            line-height: 1.5;
          }
          
          .section-content p {
            margin-bottom: 12px;
            text-align: justify;
          }
          
          .section-content ul, .section-content ol {
            margin-left: 20px;
            margin-bottom: 12px;
          }
          
          .section-content li {
            margin-bottom: 6px;
          }
          
          .section-content h1, .section-content h2, .section-content h3 {
            color: #2563eb;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          
          .footer {
            position: fixed;
            bottom: 0.5in;
            left: 0;
            right: 0;
            height: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9pt;
            color: #666;
            border-top: 1px solid #dee2e6;
            padding-top: 8px;
            background: white;
          }
          
          .footer-left {
            font-weight: bold;
            color: #dc3545;
          }
          
          .footer-center {
            font-weight: bold;
          }
          
          .footer-right {
            font-style: italic;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          @media print {
            .footer {
              position: fixed;
              bottom: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/lovable-uploads/6eb51145-ba74-4439-9904-e6239e4c50de.png" alt="Recovery Point Logo" class="logo" />
          <div class="company-info">
            <h1 class="company-name">Recovery Point West Virginia</h1>
            <p class="company-address">Professional Healthcare Services</p>
          </div>
        </div>
        
        <div class="policy-title">${policy.name || 'Untitled Policy'}</div>
        
        <table class="metadata-table">
          <tr>
            <td class="metadata-label">Policy Number:</td>
            <td class="metadata-value">${policy.policy_number || 'Not Assigned'}</td>
            <td class="metadata-label">Status:</td>
            <td class="metadata-value">${policy.status || 'Draft'}</td>
          </tr>
          <tr>
            <td class="metadata-label">Reviewer:</td>
            <td class="metadata-value">${policy.reviewer ? stripHtml(policy.reviewer) : 'Not Assigned'}</td>
            <td class="metadata-label">Created Date:</td>
            <td class="metadata-value">${new Date(policy.created_at).toLocaleDateString()}</td>
          </tr>
        </table>
        
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
          <div class="footer-left">Confidential – For Internal Use Only</div>
          <div class="footer-center">Page 1 of 1</div>
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

        {/* Action buttons - anchored to bottom with border separator */}
        <div className="pt-3 border-t space-y-2 mt-auto">
          {/* View Button for all published policies */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(policy.id)}
            className="w-full text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Policy
          </Button>

          {/* Print Policy Button - Available for all policies */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePrintPolicy(policy)}
            className="w-full text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Printer className="w-3 h-3 mr-1" />
            Print Policy
          </Button>

          {/* Update Policy Button - Show for users with edit/publish permissions */}
          {(isEditor || canPublish) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(policy.id, 'draft')}
              className="w-full text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Update Policy
            </Button>
          )}

          {/* Super Admin Delete Action for published policies */}
          {isSuperAdmin && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(policy.id)}
              className="w-full text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete Policy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
