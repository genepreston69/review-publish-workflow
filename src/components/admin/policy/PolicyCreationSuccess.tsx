
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PolicyCommentSection } from './PolicyCommentSection';

interface PolicyCreationSuccessProps {
  policyId: string;
  onStartOver: () => void;
}

export function PolicyCreationSuccess({ policyId, onStartOver }: PolicyCreationSuccessProps) {
  console.log('=== RENDERING COMMENT SECTION ===', policyId);
  
  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Policy Created Successfully</h2>
            <p className="text-muted-foreground">
              You can now add comments or notes about this policy.
            </p>
          </div>
          <button
            onClick={onStartOver}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Another Policy
          </button>
        </div>

        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            Policy created successfully! You can now add comments and notes below.
          </p>
        </div>

        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="comments">Add Comments & Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comments" className="mt-6">
            <PolicyCommentSection policyId={policyId} />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
