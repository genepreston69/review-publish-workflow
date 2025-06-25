import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Archive, Trash2, MoreHorizontal, FileText, RotateCcw, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PolicyNumberDisplay } from './PolicyNumberDisplay';
import { stripHtml } from './policyUtils';
import { Policy } from './types';
import { useAuth } from '@/hooks/useAuth';
import { usePolicyDuplication } from '@/hooks/usePolicyDuplication';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [isArchiving, setIsArchiving] = useState(false);

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
    try {
      console.log('=== STARTING POLICY UPDATE PROCESS ===', policy.id);
      const newPolicyId = await duplicatePolicyForUpdate(policy.id);
      if (newPolicyId) {
        toast({
          title: "Success",
          description: "New draft version created for editing. You can find it in Draft Policies.",
        });
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create new version for editing.",
      });
    }
  };

  const handleArchivePolicy = async () => {
    setIsArchiving(true);
    try {
      await onUpdateStatus(policy.id, 'archived');
    } catch (error) {
      console.error('Error archiving policy:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  const showUpdateButton = (isSuperAdmin || isEditor || canPublish) && policy.status === 'published';

  // Show archived status banner
  const isArchived = policy.status === 'archived';

  if (listView) {
    return (
      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {isArchived ? (
              <Info className="h-5 w-5 text-gray-400" />
            ) : (
              <FileText className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-medium truncate ${isArchived ? 'text-gray-600' : 'text-slate-800'}`}>
                {stripHtml(policy.name) || 'Untitled Policy'}
              </h3>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 shrink-0">
                {policy.policy_number}
              </Badge>
            </div>
            {isArchived && (
              <p className="text-sm text-orange-600 mb-1 font-medium">
                This policy has been archived and replaced
              </p>
            )}
            <p className={`text-sm line-clamp-1 ${isArchived ? 'text-gray-500' : 'text-slate-600'}`}>
              {stripHtml(policy.purpose)}
            </p>
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
                <DropdownMenuItem onClick={handleArchivePolicy} disabled={isArchiving}>
                  <Archive className="mr-2 h-4 w-4" />
                  {isArchiving ? 'Archiving...' : 'Archive'}
                </DropdownMenuItem>
              )}
              {isSuperAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{stripHtml(policy.name) || 'this policy'}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(policy.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-md border-slate-200 ${compact ? 'p-2' : ''} ${isArchived ? 'opacity-75' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={`${compact ? 'text-sm' : 'text-base'} font-semibold leading-tight ${isArchived ? 'text-gray-600' : 'text-slate-800'}`}>
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
            {isArchived && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                <Info className="h-3 w-3 inline mr-1" />
                This policy has been archived and replaced
              </div>
            )}
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
                <DropdownMenuItem onClick={handleArchivePolicy} disabled={isArchiving}>
                  <Archive className="mr-2 h-4 w-4" />
                  {isArchiving ? 'Archiving...' : 'Archive'}
                </DropdownMenuItem>
              )}
              {isSuperAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{stripHtml(policy.name) || 'this policy'}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(policy.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
              <p className={`${compact ? 'text-xs' : 'text-sm'} line-clamp-2 ${isArchived ? 'text-gray-500' : 'text-slate-700'}`}>
                {stripHtml(policy.purpose)}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-2 text-xs">
            {policy.reviewer && (
              <div className="flex justify-between">
                <span className="text-slate-500">Reviewer:</span>
                <span className={`font-medium truncate ml-2 ${isArchived ? 'text-gray-500' : 'text-slate-700'}`}>
                  {stripHtml(policy.reviewer)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Created:</span>
              <span className={`font-medium ${isArchived ? 'text-gray-500' : 'text-slate-700'}`}>
                {formatDate(policy.created_at)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
