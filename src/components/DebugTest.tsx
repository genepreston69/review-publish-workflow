
import React from 'react';

export const DebugTest = () => {
  console.log('=== DEBUG TEST COMPONENT RENDERED ===');
  
  return (
    <div className="p-4 bg-red-100 border border-red-300">
      <h1 className="text-red-800 font-bold">Debug Test Component</h1>
      <p className="text-red-600">If you can see this, React is working!</p>
    </div>
  );
};
