
import { useState, useRef, useCallback } from 'react';

/**
 * A safe version of useState that prevents rapid state updates
 * that could cause infinite loops
 */
export const useSafeState = <T>(
  initialState: T | (() => T),
  options: {
    maxUpdates?: number;
    timeWindow?: number;
    name?: string;
  } = {}
): [T, (value: T | ((prev: T) => T)) => void] => {
  const { maxUpdates = 50, timeWindow = 1000, name = 'Unknown State' } = options;
  const [state, setState] = useState(initialState);
  const updateCount = useRef(0);
  const lastResetTime = useRef(Date.now());

  const safeSetState = useCallback((value: T | ((prev: T) => T)) => {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now - lastResetTime.current > timeWindow) {
      updateCount.current = 0;
      lastResetTime.current = now;
    }
    
    updateCount.current += 1;
    
    // Check for potential infinite state update loop
    if (updateCount.current > maxUpdates) {
      console.error(`🚨 INFINITE STATE UPDATE LOOP DETECTED in ${name}!`);
      console.error(`State updated ${updateCount.current} times in ${timeWindow}ms`);
      console.trace('Stack trace for infinite state update loop');
      
      // Prevent further updates for a short time
      return;
    }
    
    setState(value);
  }, [maxUpdates, timeWindow, name]);

  return [state, safeSetState];
};
