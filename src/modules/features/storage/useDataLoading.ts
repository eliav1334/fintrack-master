
import { useInitialDataLoad } from "./useInitialDataLoad";
import { FinanceAction } from "@/modules/core/finance/types";

/**
 * הוק מאוחד לטעינת נתונים מאחסון מקומי
 * משתמש בהוק ממוקד יותר לטעינה ראשונית
 */
export const useDataLoading = (dispatch: React.Dispatch<FinanceAction>) => {
  // שימוש בהוק הממוקד לטעינה ראשונית
  const { isDataLoaded } = useInitialDataLoad(dispatch);

  return { isDataLoaded };
};
