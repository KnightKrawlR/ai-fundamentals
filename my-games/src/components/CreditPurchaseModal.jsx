import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../firebase';

const CreditPurchaseModal = ({ isOpen, onClose, onPurchaseComplete }) => {
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const creditPackages = {
    basic: { amount: 50, price: 4.99, name: 'Basic' },
    standard: { amount: 125, price: 9.99, name: 'Standard' },
    premium: { amount: 300, price: 19.99, name: 'Premium' }
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real app, you'd integrate with a payment processor here
      // For this demo, we'll just call the function directly
      
      const functions = getFunctions();
      const purchaseCredits = httpsCallable(functions, 'purchaseCredits');
      
      // Mock payment intent ID - in a real app this would come from payment processor
      const paymentIntentId = `demo_payment_${Date.now()}`;
      
      const result = await purchaseCredits({
        packageId: selectedPackage,
        paymentIntentId
      });
      
      setSuccess(result.data.message);
      setTimeout(() => {
        onPurchaseComplete(result.data.creditsAdded);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to process your purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Purchase Credits</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Select a credit package to continue playing and creating amazing game experiences.
          </p>
          
          <div className="space-y-3">
            {Object.entries(creditPackages).map(([id, pkg]) => (
              <div 
                key={id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedPackage === id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedPackage(id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">{pkg.name} Package</h3>
                    <p className="text-gray-600">{pkg.amount} credits</p>
                  </div>
                  <div className="text-lg font-bold text-gray-800">${pkg.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Purchase for $${creditPackages[selectedPackage].price}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditPurchaseModal; 