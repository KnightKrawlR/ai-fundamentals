import React from 'react';

const LowCreditsWarning = ({ credits, requiredCredits, onPurchaseClick }) => {
  return (
    <div className="low-credits-warning">
      <h3>Low Credits Warning</h3>
      <p>You currently have {credits} credits, but need {requiredCredits} credits to generate a game plan.</p>
      <p>Would you like to purchase more credits?</p>
      <div className="warning-actions">
        <button 
          className="purchase-btn" 
          onClick={onPurchaseClick}
        >
          Purchase Credits
        </button>
      </div>
    </div>
  );
};

export default LowCreditsWarning; 