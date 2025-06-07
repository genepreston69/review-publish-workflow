
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Archive, Trash2, MoreHorizontal, FileText, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PolicyNumberDisplay } from './PolicyNumberDisplay';
import { stripHtml } from './policyUtils';
import { Policy } from './types';
import { useAuth } from '@/hooks/useAuth';
import { usePolicyDuplication } from '@/hooks/usePolicyDuplication';

interface FacilityPolicyCardProps {
  policy: Policy;
  isEditor: boolean;
  canPublish: boolean;
  isSuperAdmin: boolean;
  onView: (policyId: string) => void;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onDelete: (policyId: string) => void;
  onRefresh?: () => void;
  compact?: boolean;
  listView?: boolean;
}

export function FacilityPolicyCard({ 
  policy, 
  isEditor, 
  canPublish, 
  isSuperAdmin, 
  onView, 
  onUpdateStatus, 
  onDelete,
  onRefresh,
  compact = false,
  listView = false
}: FacilityPolicyCardProps) {
  const { userRole } = useAuth();
  const { duplicatePolicyForUpdate, isLoading: isDuplicating } = usePolicyDuplication();

  const getStatusColor = (status: string | null) => {
    const cleanStatus = stripHtml(status);
    switch (cleanStatus?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under-review':
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleUpdatePolicy = async () => {
    const newPolicyId = await duplicatePolicyForUpdate(policy.id);
    if (newPolicyId && onRefresh) {
      onRefresh();
    }
  };

  const showUpdateButton = (isSuperAdmin || isEditor || canPublish) && policy.status === 'published';

  if (listView) {
    return (
      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-slate-800 truncate">{stripHtml(policy.name) || 'Untitled Policy'}</h3>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 shrink-0">
                {policy.policy_number}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 line-clamp-1">{stripHtml(policy.purpose)}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              <span>By {stripHtml(policy.reviewer)}</span>
              <span>{formatDate(policy.created_at)}</span>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(policy.status)} text-xs px-2 py-0.5 capitalize`}
              >
                {stripHtml(policy.status) || 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onView(policy.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          {showUpdateButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={handleUpdatePolicy}
              disabled={isDuplicating}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {policy.status === 'published' && (
                <DropdownMenuItem onClick={() => onUpdateStatus(policy.id, 'archived')}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              {isSuperAdmin && (
                <DropdownMenuItem onClick={() => onDelete(policy.id)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-md border-slate-200 ${compact ? 'p-2' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-slate-800 leading-tight`}>
              {stripHtml(policy.name) || 'Untitled Policy'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {policy.policy_number}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(policy.status)} text-xs px-2 py-0.5 capitalize`}
              >
                {stripHtml(policy.status) || 'Unknown'}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(policy.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {showUpdateButton && (
                <DropdownMenuItem onClick={handleUpdatePolicy} disabled={isDuplicating}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {isDuplicating ? 'Creating...' : 'Update'}
                </DropdownMenuItem>
              )}
              {policy.status === 'published' && (
                <DropdownMenuItem onClick={() => onUpdateStatus(policy.id, 'archived')}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              {isSuperAdmin && (
                <DropdownMenuItem onClick={() => onDelete(policy.id)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'pt-0 px-3 pb-3' : 'pt-0'}>
        <div className="space-y-3">
          {policy.purpose && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Purpose:</p>
              <p className={`text-slate-700 ${compact ? 'text-xs' : 'text-sm'} line-clamp-2`}>
                {stripHtml(policy.purpose)}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-2 text-xs">
            {policy.reviewer && (
              <div className="flex justify-between">
                <span className="text-slate-500">Reviewer:</span>
                <span className="text-slate-700 font-medium truncate ml-2">{stripHtml(policy.reviewer)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Created:</span>
              <span className="text-slate-700 font-medium">{formatDate(policy.created_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
