
import { useState } from 'react';
import { Policy } from './types';
import { PolicyCard } from './PolicyCard';
import { FacilityPoliciesEmptyState } from './FacilityPoliciesEmptyState';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid, List, LayoutGrid, RefreshCw } from 'lucide-react';

interface FacilityPoliciesGridProps {
  policies: Policy[];
  isEditor: boolean;
  canPublish: boolean;
  isSuperAdmin: boolean;
  compact?: boolean;
  onView: (policyId: string) => void;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onDelete: (policyId: string) => void;
  onRefresh?: () => void;
}

export function FacilityPoliciesGrid({
  policies,
  isEditor,
  canPublish,
  isSuperAdmin,
  compact = false,
  onView,
  onUpdateStatus,
  onDelete,
  onRefresh,
}: FacilityPoliciesGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>(compact ? 'compact' : 'grid');

  if (policies.length === 0) {
    return <FacilityPoliciesEmptyState />;
  }

  const isCompactMode = viewMode === 'compact';
  const isListMode = viewMode === 'list';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Facility Policies</h2>
          <p className="text-slate-600">View published facility policies and procedures</p>
          <p className="text-sm text-gray-600 mt-1">
            {policies.length} published facility {policies.length === 1 ? 'policy' : 'policies'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
          
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list' | 'compact')}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid className="h-4 w-4" />
              Grid
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
              List
            </ToggleGroupItem>
            <ToggleGroupItem value="compact" aria-label="Compact view">
              <LayoutGrid className="h-4 w-4" />
              Compact
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className={isListMode ? 'space-y-2' : `grid gap-4 ${isCompactMode ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {policies.map((policy) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            canPublish={canPublish}
            isEditing={isEditor}
            compact={isCompactMode}
            listView={isListMode}
            onUpdateStatus={onUpdateStatus}
            onView={onView}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
