
/**
 * Hook for formatting currency values
 */
export const useCurrencyFormatter = () => {
  // פונקציה לפורמט סכומים כמטבע
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(value);
  };

  return { formatCurrency };
};
