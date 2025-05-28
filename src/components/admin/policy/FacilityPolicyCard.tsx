
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

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${policy.name || 'Policy'}</title>
        <style>
          @media print {
            @page {
              margin: 1in;
              size: letter;
            }
          }
          
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .policy-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .policy-number {
            font-family: monospace;
            background: #f5f5f5;
            padding: 5px 10px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 10px;
          }
          
          .metadata {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: #666;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          
          .section-content {
            margin-left: 0;
          }
          
          .section-content p {
            margin-bottom: 10px;
          }
          
          .section-content ul, .section-content ol {
            margin-left: 20px;
            margin-bottom: 10px;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="policy-title">${policy.name || 'Untitled Policy'}</div>
          ${policy.policy_number ? `<div class="policy-number">${policy.policy_number}</div>` : ''}
          <div class="metadata">
            ${policy.reviewer ? `<span>Reviewer: ${stripHtml(policy.reviewer)}</span>` : ''}
            <span>Created: ${new Date(policy.created_at).toLocaleDateString()}</span>
            ${policy.status ? `<span>Status: ${policy.status}</span>` : ''}
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
          This document was printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
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
        <div className="pt-3 border-t space-y-2 mt-3">
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
