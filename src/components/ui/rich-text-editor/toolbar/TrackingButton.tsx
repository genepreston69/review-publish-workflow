
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TrackingButtonProps {
  trackingEnabled: boolean;
  onToggleTracking: () => void;
}

export function TrackingButton({ trackingEnabled, onToggleTracking }: TrackingButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={trackingEnabled ? "default" : "outline"}
          size="sm"
          onClick={onToggleTracking}
        >
          Track Changes
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{trackingEnabled ? "Disable Change Tracking" : "Enable Change Tracking"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
