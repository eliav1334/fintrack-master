
/**
 * פונקציה לפרסור סכומים
 */
export const parseAmount = (amountValue: any): number => {
  let amount: number;
  
  if (typeof amountValue === 'number') {
    amount = amountValue;
  } else {
    // ניקוי הסכום מתווים מיוחדים
    const amountStr = String(amountValue || '0').replace(/[^\d.-]/g, '');
    amount = parseFloat(amountStr) || 0;
  }
  
  return amount;
};

/**
 * פונקציה לפרסור סכום עסקה מקורי (לפני תשלומים)
 */
export const parseTotalAmount = (totalAmountValue: any): number => {
  if (!totalAmountValue) return 0;
  
  let totalAmount: number;
  if (typeof totalAmountValue === 'number') {
    totalAmount = totalAmountValue;
  } else {
    const totalAmountStr = String(totalAmountValue || '0').replace(/[^\d.-]/g, '');
    totalAmount = parseFloat(totalAmountStr) || 0;
  }
  
  return totalAmount;
};
