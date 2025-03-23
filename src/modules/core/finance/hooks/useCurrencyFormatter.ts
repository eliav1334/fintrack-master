
import { useMemo } from "react";

/**
 * הוק לפורמט כספים בפורמט שקלים
 */
export const useCurrencyFormatter = () => {
  // יצירת פורמטר למטבע
  const formatter = useMemo(() => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }, []);

  // פונקציה לפורמט מספר כמטבע
  const formatCurrency = (amount: number | string) => {
    try {
      const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
      
      // אם לא מספר תקין, מחזיר 0
      if (isNaN(numericAmount)) {
        return formatter.format(0);
      }
      
      return formatter.format(numericAmount);
    } catch (error) {
      console.error("שגיאה בפורמוט מטבע:", error);
      return formatter.format(0);
    }
  };

  // פונקציה לפורמט מספר כמטבע עם סימון צבע
  const formatWithColor = (amount: number | string) => {
    try {
      const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
      
      // אם לא מספר תקין, מחזיר 0
      if (isNaN(numericAmount)) {
        return {
          formattedValue: formatter.format(0),
          isNegative: false,
          isPositive: false,
          isZero: true
        };
      }
      
      return {
        formattedValue: formatter.format(numericAmount),
        isNegative: numericAmount < 0,
        isPositive: numericAmount > 0,
        isZero: numericAmount === 0
      };
    } catch (error) {
      console.error("שגיאה בפורמוט מטבע עם צבע:", error);
      return {
        formattedValue: formatter.format(0),
        isNegative: false,
        isPositive: false,
        isZero: true
      };
    }
  };

  return {
    formatCurrency,
    formatWithColor
  };
};
