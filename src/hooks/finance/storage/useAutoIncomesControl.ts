
import { useCallback } from "react";
import { toast } from "sonner";
import { SYSTEM_CONSTANTS } from "./constants/systemConstants";

/**
 * הוק לניהול הכנסות אוטומטיות
 */
export const useAutoIncomesControl = () => {
  /**
   * מאפשר הכנסות אוטומטיות (מבטל את הדילוג)
   */
  const enableAutoIncomes = useCallback(() => {
    localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.SKIP_AUTO_INCOMES);
    localStorage.removeItem(SYSTEM_CONSTANTS.KEYS.PERMANENT_SKIP_AUTO_INCOMES);
    toast.success(SYSTEM_CONSTANTS.MESSAGES.SUCCESS.AUTO_INCOMES_ENABLED);
  }, []);

  return {
    enableAutoIncomes
  };
};
