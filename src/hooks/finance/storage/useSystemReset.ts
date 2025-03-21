
import { useState } from "react";
import { useImportBlocker } from "./useImportBlocker";
import { useAutoIncomesControl } from "./useAutoIncomesControl";
import { useResetManager } from "./useResetManager";

/**
 * הוק מאוחד לפונקציונליות איפוס מערכת
 * גרסה מרוכזת ומפוצלת לקבצים קטנים עם אחריות ממוקדת
 */
export const useSystemReset = () => {
  // שימוש בהוקים המפוצלים
  const { isImportBlocked, enableDataImport, importBlocked } = useImportBlocker();
  const { enableAutoIncomes } = useAutoIncomesControl();
  const { resetAllStoredData } = useResetManager();

  return {
    resetAllStoredData,
    enableAutoIncomes,
    isImportBlocked,
    enableDataImport,
    importBlocked
  };
};
