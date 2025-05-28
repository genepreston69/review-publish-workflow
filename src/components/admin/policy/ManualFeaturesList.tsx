
import { Card, CardContent } from '@/components/ui/card';

export function ManualFeaturesList() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-gray-600 space-y-2">
          <h4 className="font-medium text-gray-900">Professional Features:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Official Recovery Point West Virginia logo and branding</li>
            <li>Professional cover page with complete organization details</li>
            <li>Single-page table of contents with clickable policy links</li>
            <li>Consistent headers with logo and manual title</li>
            <li>Clean footers with proper page numbering</li>
            <li>Board-ready formatting with professional typography</li>
            <li>Each policy on separate page with enhanced metadata</li>
            <li>Print-optimized layout with proper page breaks</li>
            <li>Professional color scheme and visual hierarchy</li>
            <li>All-caps section headers (PURPOSE, POLICY, PROCEDURE)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
