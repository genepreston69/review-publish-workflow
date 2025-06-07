
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FacilityPolicyCard } from './FacilityPolicyCard';
import { Policy } from './types';

interface FacilityPoliciesGridProps {
  policies: Policy[];
  isEditor: boolean;
  canPublish: boolean;
  isSuperAdmin: boolean;
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
  onView, 
  onUpdateStatus, 
  onDelete,
  onRefresh
}: FacilityPoliciesGridProps) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'compact'

  return (
    <div className="space-y-6">
      {/* Header with view controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Facility Policies</h2>
          <p className="text-slate-600">View published facility policies and procedures</p>
          {policies.length > 0 && (
            <p className="text-sm text-slate-500">{policies.length} published facility {policies.length === 1 ? 'policy' : 'policies'}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="text-xs"
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="text-xs"
          >
            List
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="text-xs"
          >
            Compact
          </Button>
        </div>
      </div>

      {/* Responsive grid/list view */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {policies.map((policy) => (
            <FacilityPolicyCard
              key={policy.id}
              policy={policy}
              isEditor={isEditor}
              canPublish={canPublish}
              isSuperAdmin={isSuperAdmin}
              onView={onView}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
              onRefresh={onRefresh}
              listView={true}
            />
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'compact' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        }`}>
          {policies.map((policy) => (
            <FacilityPolicyCard
              key={policy.id}
              policy={policy}
              isEditor={isEditor}
              canPublish={canPublish}
              isSuperAdmin={isSuperAdmin}
              onView={onView}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
              onRefresh={onRefresh}
              compact={viewMode === 'compact'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
