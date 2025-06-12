
import { useRef, useEffect } from 'react';

interface LoopDetectionOptions {
  maxRenders?: number;
  timeWindow?: number;
  componentName?: string;
}

export const useInfiniteLoopProtection = (
  options: LoopDetectionOptions = {}
) => {
  const {
    maxRenders = 50,
    timeWindow = 1000,
    componentName = 'Unknown Component'
  } = options;

  const renderCount = useRef(0);
  const lastResetTime = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now - lastResetTime.current > timeWindow) {
      renderCount.current = 0;
      lastResetTime.current = now;
    }
    
    renderCount.current += 1;
    
    // Check for potential infinite loop
    if (renderCount.current > maxRenders) {
      console.error(`🚨 INFINITE LOOP DETECTED in ${componentName}!`);
      console.error(`Component has rendered ${renderCount.current} times in ${timeWindow}ms`);
      console.trace('Stack trace for infinite loop detection');
      
      // Reset to prevent console spam
      renderCount.current = 0;
      lastResetTime.current = now;
      
      // Optionally throw error in development
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`Infinite loop detected in ${componentName}. Check your useEffect dependencies and state updates.`);
      }
    }
  });

  return {
    renderCount: renderCount.current,
    isHighFrequency: renderCount.current > maxRenders * 0.7
  };
};
