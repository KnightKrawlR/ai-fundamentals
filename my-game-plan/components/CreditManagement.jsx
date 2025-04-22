import React, { useState, useEffect } from 'react';

const CreditManagement = ({ initialCredits, render, onUpdateCredits }) => {
  const [credits, setCredits] = useState(initialCredits || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCredits(initialCredits || 0);
  }, [initialCredits]);

  const handleAddCredits = async (amount) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onUpdateCredits(amount);
      setCredits(prevCredits => prevCredits + amount);
    } catch (error) {
      console.error('Error updating credits:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return render(credits, handleAddCredits);
};

export default CreditManagement; 