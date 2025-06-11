
import React, { useState, useEffect, useRef } from 'react';

interface RenderLoopProtectionProps {
  children: React.ReactNode;
  maxRenders?: number;
  timeWindow?: number; // milliseconds
}

export const RenderLoopProtection: React.FC<RenderLoopProtectionProps> = ({ 
  children, 
  maxRenders = 100,
  timeWindow = 5000 
}) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());
  const [isBlocked, setIsBlocked] = useState(false);
  const [error, setError] = useState<string>('');

  // Reset counter every time window
  useEffect(() => {
    const now = Date.now();
    if (now - startTime.current > timeWindow) {
      renderCount.current = 0;
      startTime.current = now;
      if (isBlocked) {
        setIsBlocked(false);
        setError('');
      }
    }
  });

  // Check render count
  renderCount.current++;
  
  if (renderCount.current > maxRenders && !isBlocked) {
    setIsBlocked(true);
    setError(`Infinite render loop detected: ${renderCount.current} renders in ${timeWindow}ms`);
    console.error('🚨 RENDER LOOP PROTECTION ACTIVATED');
    console.error(`Renders: ${renderCount.current} in ${Date.now() - startTime.current}ms`);
  }

  if (isBlocked) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#dc2626',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}>
        <h1>🚨 EMERGENCY STOP</h1>
        <p style={{ fontSize: '18px', margin: '20px', textAlign: 'center' }}>
          {error}
        </p>
        <p style={{ margin: '10px', opacity: 0.8 }}>
          This protection prevented your app from crashing.
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: 'white',
              color: '#dc2626',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
          <button 
            onClick={() => {
              renderCount.current = 0;
              startTime.current = Date.now();
              setIsBlocked(false);
              setError('');
            }}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again (Risky)
          </button>
        </div>
        <p style={{ fontSize: '12px', margin: '20px', opacity: 0.6 }}>
          Check console for detailed error information
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
