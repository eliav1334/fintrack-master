
import { useImportBlocker } from "./useImportBlocker";
import { useAutoIncomesControl } from "./useAutoIncomesControl";
import { useResetManager } from "./useResetManager";

/**
 * הוק מאוחד לפונקציונליות איפוס מערכת
 * נקודת גישה אחידה לפונקציות מהוקים שונים
 */
export const useSystemReset = () => {
  // שימוש בהוקים המפוצלים
  const { isImportBlocked, checkImportBlockStatus, enableDataImport, setImportBlocked } = useImportBlocker();
  const { enableAutoIncomes } = useAutoIncomesControl();
  const { resetAllStoredData } = useResetManager();

  return {
    resetAllStoredData,
    enableAutoIncomes,
    isImportBlocked,
    checkImportBlockStatus,
    enableDataImport,
    setImportBlocked
  };
};
