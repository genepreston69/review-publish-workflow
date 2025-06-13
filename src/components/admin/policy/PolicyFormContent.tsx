
import { CardContent } from '@/components/ui/card';
import { PolicyFormFields } from './PolicyFormFields';
import { PolicyNumberDisplay } from './PolicyNumberDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { PolicyFormValues } from './PolicyFormSchema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent as InnerCardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface PolicyFormContentProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  generatedPolicyNumber: string;
  isGeneratingNumber?: boolean;
  numberGenerationError?: string | null;
  form: UseFormReturn<PolicyFormValues>;
  isNewPolicy?: boolean;
}

export function PolicyFormContent({ 
  onSubmit, 
  isSubmitting, 
  generatedPolicyNumber,
  isGeneratingNumber = false,
  numberGenerationError = null,
  form,
  isNewPolicy = false
}: PolicyFormContentProps) {
  const [notes, setNotes] = useState('');

  return (
    <CardContent>
      <Tabs defaultValue="policy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="policy">Policy Details</TabsTrigger>
          <TabsTrigger value="notes">Notes & Comments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="policy" className="mt-6">
          <PolicyFormFields 
            onSubmit={onSubmit}
            isLoading={isSubmitting}
            submitLabel="Create Policy"
            form={form}
            isNewPolicy={isNewPolicy}
          />
          
          {/* Policy number generation status */}
          {isGeneratingNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-900">Generating policy number...</span>
              </div>
            </div>
          )}
          
          {numberGenerationError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {numberGenerationError}
              </AlertDescription>
            </Alert>
          )}
          
          <PolicyNumberDisplay policyNumber={generatedPolicyNumber} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Policy Notes & Comments</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add any notes, comments, or additional information about this policy.
              </p>
            </CardHeader>
            <InnerCardContent className="space-y-4">
              <Textarea
                placeholder="Add your notes, comments, or additional information about this policy..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px]"
              />
              <div className="text-sm text-muted-foreground">
                <p>These notes will be saved with your policy and can be viewed by other users with appropriate permissions.</p>
              </div>
            </InnerCardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CardContent>
  );
}
