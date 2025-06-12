
import { useCallback, useRef } from 'react';

/**
 * A safe version of useCallback that prevents infinite loops by tracking
 * when callbacks are called too frequently
 */
export const useSafeCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: {
    maxCalls?: number;
    timeWindow?: number;
    name?: string;
  } = {}
): T => {
  const { maxCalls = 100, timeWindow = 1000, name = 'Unknown Callback' } = options;
  const callCount = useRef(0);
  const lastResetTime = useRef(Date.now());

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now - lastResetTime.current > timeWindow) {
      callCount.current = 0;
      lastResetTime.current = now;
    }
    
    callCount.current += 1;
    
    // Check for potential infinite callback loop
    if (callCount.current > maxCalls) {
      console.error(`🚨 INFINITE CALLBACK LOOP DETECTED in ${name}!`);
      console.error(`Callback called ${callCount.current} times in ${timeWindow}ms`);
      console.trace('Stack trace for infinite callback loop');
      
      // Prevent further calls for a short time
      return;
    }
    
    return callback(...args);
  }, deps) as T;
};
