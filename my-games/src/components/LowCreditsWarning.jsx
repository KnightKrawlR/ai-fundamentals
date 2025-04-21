import React from 'react';

const LowCreditsWarning = ({ credits, onAddCredits }) => {
  // No warning needed if credits are sufficient
  if (credits > 20) {
    return null;
  }

  return (
    <div className={`p-4 mb-4 rounded-lg text-sm ${credits === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
      {credits === 0 ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <span className="font-bold">You've run out of credits!</span> 
            <p className="mt-1">Purchase more credits to continue your game experience.</p>
          </div>
          <button 
            className="mt-3 sm:mt-0 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={onAddCredits}
          >
            Get Credits Now
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <span className="font-bold">Low Credits Warning: {credits} {credits === 1 ? 'credit' : 'credits'} remaining</span>
            <p className="mt-1">You're running low on credits. Consider purchasing more to avoid interruptions.</p>
          </div>
          <button 
            className="mt-3 sm:mt-0 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            onClick={onAddCredits}
          >
            Add Credits
          </button>
        </div>
      )}
    </div>
  );
};

export default LowCreditsWarning; 