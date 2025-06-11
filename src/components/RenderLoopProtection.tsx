
import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface RenderLoopProtectionProps {
  children: React.ReactNode;
  maxRenders?: number;
  timeWindow?: number;
}

export const RenderLoopProtection: React.FC<RenderLoopProtectionProps> = ({
  children,
  maxRenders = 50,
  timeWindow = 3000,
}) => {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    const now = Date.now();
    renderTimes.current.push(now);
    renderCount.current++;

    // Clean old render times outside the time window
    renderTimes.current = renderTimes.current.filter(
      time => now - time < timeWindow
    );

    // Check if we've exceeded the render limit
    if (renderTimes.current.length > maxRenders) {
      console.error('🚨 RENDER LOOP DETECTED! Blocking further renders.');
      console.error(`Detected ${renderTimes.current.length} renders in ${timeWindow}ms`);
      
      setIsBlocked(true);
      setBlockReason(
        `Detected ${renderTimes.current.length} renders in ${timeWindow}ms (limit: ${maxRenders})`
      );
      
      // Clear render history to prevent further triggers
      renderTimes.current = [];
      renderCount.current = 0;
    }
  });

  const handleReload = () => {
    window.location.reload();
  };

  const handleForceUnblock = () => {
    setIsBlocked(false);
    setBlockReason('');
    renderTimes.current = [];
    renderCount.current = 0;
    console.log('🔓 Render loop protection manually disabled');
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-red-800 mb-2">
            Render Loop Detected
          </h1>
          
          <p className="text-gray-600 mb-4">
            The application has been stopped to prevent a browser crash.
          </p>
          
          <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
            <p className="text-sm text-red-700">
              <strong>Reason:</strong> {blockReason}
            </p>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleReload}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </button>
            
            <button
              onClick={handleForceUnblock}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
            >
              Force Continue (Risky)
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>If this keeps happening:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Check for infinite useEffect loops</li>
              <li>Look for state updates that trigger re-renders</li>
              <li>Verify dependency arrays in hooks</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
