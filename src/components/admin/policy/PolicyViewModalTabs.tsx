
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PolicyViewContent } from './PolicyViewContent';
import { PolicyCommentSection } from './PolicyCommentSection';
import { PolicyVersionHistory } from './PolicyVersionHistory';
import { PolicyViewMetadata } from './PolicyViewMetadata';
import { Policy } from './types';

interface PolicyViewModalTabsProps {
  policy: Policy;
  policyId: string;
  onViewVersion: (versionId: string) => void;
  onViewReplacement: (replacementPolicyId: string) => void;
}

export function PolicyViewModalTabs({
  policy,
  policyId,
  onViewVersion,
  onViewReplacement
}: PolicyViewModalTabsProps) {
  return (
    <Tabs defaultValue="content" className="flex-1 overflow-hidden">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="content">Policy Content</TabsTrigger>
        <TabsTrigger value="comments">Discussion</TabsTrigger>
        <TabsTrigger value="versions">Version History</TabsTrigger>
        <TabsTrigger value="metadata">Metadata</TabsTrigger>
      </TabsList>
      
      <TabsContent value="content" className="overflow-y-auto max-h-[55vh]">
        <div className="space-y-4">
          <PolicyViewContent 
            policy={policy} 
            onViewReplacement={onViewReplacement}
          />
        </div>
      </TabsContent>

      <TabsContent value="comments" className="overflow-y-auto max-h-[55vh]">
        <PolicyCommentSection policyId={policy.id} />
      </TabsContent>
      
      <TabsContent value="versions" className="overflow-y-auto max-h-[55vh]">
        <PolicyVersionHistory 
          policyId={policyId} 
          onViewVersion={onViewVersion}
        />
      </TabsContent>

      <TabsContent value="metadata" className="overflow-y-auto max-h-[55vh]">
        <PolicyViewMetadata policy={policy} />
      </TabsContent>
    </Tabs>
  );
}
