
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FinanceAction } from "@/modules/core/finance/types";

/**
 * הוק לטעינה ראשונית של נתונים מאחסון מקומי
 */
export const useInitialDataLoad = (dispatch: React.Dispatch<FinanceAction>) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const loadDataFromStorage = () => {
      try {
        // בדיקה אם יש איפוס בתהליך
        const isResetInProgress = localStorage.getItem("reset_in_progress") === "true";
        if (isResetInProgress) {
          console.log("דילוג על טעינת נתונים מאחסון: איפוס מערכת בתהליך");
          // מסיר את דגל האיפוס
          localStorage.removeItem("reset_in_progress");
          setIsDataLoaded(true);
          return;
        }

        // טעינת נתונים מאחסון מקומי
        const storedData = localStorage.getItem("financeState");
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            
            // בדיקת תקינות הנתונים
            if (parsedData && typeof parsedData === 'object') {
              // טעינת עסקאות
              if (Array.isArray(parsedData.transactions)) {
                dispatch({ 
                  type: "ADD_TRANSACTIONS", 
                  payload: parsedData.transactions 
                });
              }
              
              // טעינת תקציבים
              if (Array.isArray(parsedData.budgets)) {
                parsedData.budgets.forEach(budget => {
                  dispatch({ 
                    type: "SET_BUDGET", 
                    payload: budget 
                  });
                });
              }
              
              // טעינת מיפויי קטגוריות
              if (Array.isArray(parsedData.categoryMappings)) {
                dispatch({ 
                  type: "SET_CATEGORY_MAPPINGS", 
                  payload: parsedData.categoryMappings 
                });
              }
              
              console.log("נתונים נטענו בהצלחה מאחסון מקומי", {
                transactions: parsedData.transactions?.length || 0,
                budgets: parsedData.budgets?.length || 0,
                categoryMappings: parsedData.categoryMappings?.length || 0
              });
            }
          } catch (parseError) {
            console.error("שגיאה בניתוח נתונים מאחסון מקומי:", parseError);
            toast.error("שגיאה בטעינת נתונים", {
              description: "הנתונים השמורים פגומים. ייתכן שתצטרך לאפס את המערכת."
            });
          }
        } else {
          console.log("לא נמצאו נתונים באחסון מקומי");
        }
      } catch (error) {
        console.error("שגיאה בטעינת נתונים מאחסון מקומי:", error);
        toast.error("שגיאה בטעינת נתונים", {
          description: "לא ניתן היה לטעון את הנתונים. נסה לרענן את הדף."
        });
      } finally {
        // סימון שהנתונים נטענו (הצליח או נכשל)
        setIsDataLoaded(true);
      }
    };

    // טעינת נתונים בטעינה ראשונית
    loadDataFromStorage();
  }, [dispatch]);

  return { isDataLoaded };
};
