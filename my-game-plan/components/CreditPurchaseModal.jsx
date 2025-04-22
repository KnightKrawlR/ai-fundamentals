import React, { useState } from 'react';

const CreditPurchaseModal = ({ isOpen, onClose, onPurchase }) => {
  const [selectedPackage, setSelectedPackage] = useState('basic');

  if (!isOpen) return null;

  const packages = {
    basic: { credits: 10, price: '$4.99' },
    standard: { credits: 25, price: '$9.99' },
    premium: { credits: 60, price: '$19.99' }
  };

  const handlePurchase = () => {
    onPurchase(packages[selectedPackage].credits);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Purchase Credits</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <p>Select a credit package:</p>
          
          <div className="package-options">
            {Object.entries(packages).map(([key, pkg]) => (
              <div 
                key={key}
                className={`package-option ${selectedPackage === key ? 'selected' : ''}`}
                onClick={() => setSelectedPackage(key)}
              >
                <h3>{key.charAt(0).toUpperCase() + key.slice(1)} Package</h3>
                <p>{pkg.credits} Credits</p>
                <p className="price">{pkg.price}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="purchase-btn" onClick={handlePurchase}>
            Purchase {packages[selectedPackage].credits} Credits
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditPurchaseModal; 