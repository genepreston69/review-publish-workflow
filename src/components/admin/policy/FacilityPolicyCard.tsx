
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
            text-align: center;
            padding-bottom: 20px;
            margin-bottom: 25px;
            border-bottom: 2px solid #2563eb;
          }
          
          .logo {
            max-width: 300px;
            max-height: 80px;
            margin: 0 auto 15px auto;
            display: block;
          }
          
          .company-name {
            font-size: 18pt;
            font-weight: bold;
            color: #2563eb;
            margin: 0 0 10px 0;
            text-align: center;
          }
          
          .divider-line {
            width: 100%;
            height: 2px;
            background: linear-gradient(to right, #2563eb, #60a5fa, #2563eb);
            margin: 15px 0;
          }
          
          .policy-title {
            font-size: 22pt;
            font-weight: bold;
            margin: 25px 0 20px 0;
            color: #333;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .metadata-table {
            width: 100%;
            margin: 20px 0 35px 0;
            border-collapse: collapse;
            background: #f8f9fa;
            border: 2px solid #2563eb;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .metadata-table td {
            padding: 12px 16px;
            border-right: 1px solid #dee2e6;
            font-size: 11pt;
            vertical-align: top;
          }
          
          .metadata-table tr:first-child td {
            border-bottom: 1px solid #dee2e6;
          }
          
          .metadata-table td:last-child {
            border-right: none;
          }
          
          .metadata-label {
            font-weight: bold;
            background: #e3f2fd;
            width: 50%;
            color: #1565c0;
          }
          
          .metadata-value {
            background: white;
            width: 50%;
          }
          
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            margin: 30px 0 15px 0;
            color: #1565c0;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
            position: relative;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 50px;
            height: 2px;
            background: #60a5fa;
          }
          
          .section-content {
            margin-left: 0;
            line-height: 1.6;
            margin-top: 15px;
          }
          
          .section-content p {
            margin-bottom: 14px;
            text-align: justify;
          }
          
          .section-content ul, .section-content ol {
            margin-left: 25px;
            margin-bottom: 14px;
          }
          
          .section-content li {
            margin-bottom: 8px;
            line-height: 1.5;
          }
          
          .section-content h1, .section-content h2, .section-content h3 {
            color: #1565c0;
            margin-top: 25px;
            margin-bottom: 12px;
            font-weight: bold;
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
          
          .footer {
            position: fixed;
            bottom: 0.5in;
            left: 0;
            right: 0;
            height: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9pt;
            color: #666;
            border-top: 1px solid #dee2e6;
            padding-top: 10px;
            background: white;
          }
          
          .footer-left {
            font-weight: bold;
            color: #dc3545;
            flex: 1;
          }
          
          .footer-center {
            font-weight: bold;
            text-align: center;
            flex: 1;
          }
          
          .footer-right {
            font-style: italic;
            text-align: right;
            flex: 1;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          @media print {
            .footer {
              position: fixed;
              bottom: 0;
            }
            
            body {
              padding-bottom: 60px;
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
        <div class="header">
          <img src="/lovable-uploads/acf8d05c-3cb0-46eb-841c-b50ed425544d.png" alt="Recovery Point West Virginia Logo" class="logo" />
          <h1 class="company-name">Recovery Point West Virginia</h1>
          <div class="divider-line"></div>
        </div>
        
        <div class="policy-title">${policy.name || 'Untitled Policy'}</div>
        
        <table class="metadata-table">
          <tr>
            <td class="metadata-label">Policy Number:</td>
            <td class="metadata-value">${policy.policy_number || 'Not Assigned'}</td>
          </tr>
          <tr>
            <td class="metadata-label">Status:</td>
            <td class="metadata-value">${policy.status || 'Draft'}</td>
          </tr>
          <tr>
            <td class="metadata-label">Reviewer:</td>
            <td class="metadata-value">${policy.reviewer ? stripHtml(policy.reviewer) : 'Not Assigned'}</td>
          </tr>
          <tr>
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
