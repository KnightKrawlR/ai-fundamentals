import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/functions';

const CreditPurchaseModal = ({ isOpen, onClose, insufficientCreditsData, onPurchase }) => {
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const creditPackages = {
    basic: { amount: 20, price: '$1.99', popular: false },
    standard: { amount: 50, price: '$3.99', popular: true },
    premium: { amount: 100, price: '$6.99', popular: false }
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // Call Firebase function to purchase credits
      const purchaseCreditsFunction = firebase.functions().httpsCallable('purchaseCredits');
      
      const result = await purchaseCreditsFunction({
        package: selectedPackage,
        amount: creditPackages[selectedPackage].amount,
        paymentMethod: 'demo' // In a real app, this would be payment info from a form
      });
      
      if (result.data && result.data.success) {
        onPurchase(creditPackages[selectedPackage].amount);
        onClose();
      } else {
        setErrorMessage(result.data?.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      setErrorMessage('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Purchase Credits</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {insufficientCreditsData && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            <p>{insufficientCreditsData.message}</p>
          </div>
        )}
        
        <div className="space-y-4 my-4">
          <div className="text-lg font-medium">Select a credit package:</div>
          
          <div className="grid gap-4">
            {Object.entries(creditPackages).map(([key, pkg]) => (
              <div 
                key={key}
                onClick={() => setSelectedPackage(key)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPackage === key 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-200'
                } ${pkg.popular ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-xl">{pkg.amount} Credits</span>
                    <p className="text-gray-600">{pkg.price}</p>
                  </div>
                  {pkg.popular && (
                    <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
            <p>{errorMessage}</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Purchase Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditPurchaseModal; 