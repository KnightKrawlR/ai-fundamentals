import React from 'react';

const CreditManagement = ({ credits, showWarning = false, onAddCredits }) => {
  return (
    <div className="p-2 flex justify-between items-center bg-gray-100 rounded-md mb-2">
      <div className="flex items-center">
        <span className="font-medium mr-1">Credits:</span>
        <span className={`font-bold ${showWarning ? 'text-red-600' : ''}`}>
          {credits !== null ? credits : '—'}
        </span>
        
        {showWarning && (
          <span className="ml-2 text-red-600 text-sm">
            Low credits! Your experience may be limited.
          </span>
        )}
      </div>
      
      <button 
        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        onClick={onAddCredits}
        data-credit-button
      >
        Add Credits
      </button>
    </div>
  );
};

export default CreditManagement; 