
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Transaction, CategoryType, Budget, FileImportFormat } from "@/types";
import { FinanceContextType, FinanceState, CategoryMapping } from "./types";
import { financeReducer } from "./financeReducer";
import { initialState } from "./defaultValues";
import { generateId } from "@/utils/generateId";
import { format } from "date-fns";

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // טעינת נתונים מהאחסון המקומי בעת הרינדור הראשוני
  useEffect(() => {
    const savedState = localStorage.getItem("financeState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.transactions) {
          dispatch({ type: "ADD_TRANSACTIONS", payload: parsedState.transactions });
        }
        if (parsedState.budgets) {
          parsedState.budgets.forEach((budget: Budget) => {
            dispatch({ type: "SET_BUDGET", payload: budget });
          });
        }
        if (parsedState.categoryMappings) {
          // טעינת מיפויי קטגוריות שמורים
          dispatch({ 
            type: "ADD_TRANSACTIONS", 
            payload: [] 
          }); // מיפויים מיושמים באופן אוטומטי בנכסים
        }
      } catch (error) {
        console.error("שגיאה בטעינת נתונים מהאחסון המקומי:", error);
      }
    }
    
    // בדיקה אם נדרש להוסיף הכנסה חודשית אוטומטית
    setTimeout(() => {
      checkForMonthlyIncome();
    }, 1000); // מחכה שניה אחת לאפשר לנתונים להיטען
  }, []);

  // שמירת נתונים באחסון המקומי בכל פעם שהם משתנים
  useEffect(() => {
    localStorage.setItem(
      "financeState",
      JSON.stringify({
        transactions: state.transactions,
        budgets: state.budgets,
        categoryMappings: state.categoryMappings
      })
    );
  }, [state.transactions, state.budgets, state.categoryMappings]);
  
  /**
   * בדיקה אם נדרש להוסיף הכנסה חודשית אוטומטית של 16,000 ₪
   */
  const checkForMonthlyIncome = () => {
    const currentDate = new Date();
    const currentMonth = format(currentDate, "yyyy-MM");
    
    // בדיקה אם כבר נרשמה הכנסה קבועה לחודש הנוכחי
    const hasMonthlyIncome = state.transactions.some(transaction => {
      // בודק אם זו הכנסה בסך 16000
      const isMonthlyIncome = transaction.type === "income" && transaction.amount === 16000;
      
      // מחלץ את החודש והשנה מתאריך העסקה
      const transactionMonth = transaction.date ? format(new Date(transaction.date), "yyyy-MM") : "";
      
      // החזרת אמת אם נמצאה עסקה מתאימה בחודש הנוכחי
      return isMonthlyIncome && transactionMonth === currentMonth;
    });
    
    // בדיקת חודשים קודמים שבהם אין הכנסה קבועה
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return format(date, "yyyy-MM");
    });
    
    // אם אין הכנסה חודשית לחודש הנוכחי, מוסיף אותה
    if (!hasMonthlyIncome) {
      const monthlyIncome: Omit<Transaction, "id"> = {
        description: "משכורת חודשית קבועה",
        amount: 16000,
        type: "income",
        date: format(currentDate, "yyyy-MM-dd"),
        categoryId: "",  // ניתן להוסיף קטגוריה מתאימה אם קיימת
        notes: "הכנסה חודשית קבועה"
      };
      
      addTransaction(monthlyIncome);
      
      console.log("נוספה הכנסה חודשית של 16,000 ₪ לחודש הנוכחי", currentMonth);
    }
    
    // הוספת הכנסות חודשיות לחודשים קודמים
    last6Months.slice(1).forEach(month => {
      const hasIncome = state.transactions.some(transaction => {
        const isMonthlyIncome = transaction.type === "income" && transaction.amount === 16000;
        const transactionMonth = transaction.date ? format(new Date(transaction.date), "yyyy-MM") : "";
        return isMonthlyIncome && transactionMonth === month;
      });
      
      if (!hasIncome) {
        // יצירת תאריך לאמצע החודש הנבחר
        const [year, monthNum] = month.split("-");
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 15);
        
        const monthlyIncome: Omit<Transaction, "id"> = {
          description: "משכורת חודשית קבועה",
          amount: 16000,
          type: "income",
          date: format(date, "yyyy-MM-dd"),
          categoryId: "",
          notes: `הכנסה חודשית קבועה לחודש ${month}`
        };
        
        addTransaction(monthlyIncome);
        console.log(`נוספה הכנסה חודשית של 16,000 ₪ לחודש ${month}`);
      }
    });
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId("tx"),
    };
    dispatch({ type: "ADD_TRANSACTION", payload: newTransaction });
  };

  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: "UPDATE_TRANSACTION", payload: transaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
  };

  const addTransactions = (transactions: Omit<Transaction, "id">[]) => {
    const newTransactions: Transaction[] = transactions.map((transaction) => ({
      ...transaction,
      id: generateId("tx"),
    }));
    dispatch({ type: "ADD_TRANSACTIONS", payload: newTransactions });
  };

  const addCategory = (category: Omit<CategoryType, "id">) => {
    const newCategory: CategoryType = {
      ...category,
      id: generateId("cat"),
    };
    dispatch({ type: "ADD_CATEGORY", payload: newCategory });
  };

  const updateCategory = (category: CategoryType) => {
    dispatch({ type: "UPDATE_CATEGORY", payload: category });
  };

  const deleteCategory = (id: string) => {
    dispatch({ type: "DELETE_CATEGORY", payload: id });
  };

  const setBudget = (budget: Omit<Budget, "id">) => {
    const newBudget: Budget = {
      ...budget,
      id: generateId("budget"),
      startDate: new Date().toISOString(), // הוספנו תאריך התחלה
    };
    dispatch({ type: "SET_BUDGET", payload: newBudget });
  };

  const deleteBudget = (id: string) => {
    dispatch({ type: "DELETE_BUDGET", payload: id });
  };

  const addImportFormat = (format: Omit<FileImportFormat, "id">) => {
    const newFormat: FileImportFormat = {
      ...format,
      id: generateId("format"),
    };
    dispatch({ type: "ADD_IMPORT_FORMAT", payload: newFormat });
  };

  const updateImportFormat = (format: FileImportFormat) => {
    dispatch({ type: "UPDATE_IMPORT_FORMAT", payload: format });
  };

  const deleteImportFormat = (id: string) => {
    dispatch({ type: "DELETE_IMPORT_FORMAT", payload: id });
  };
  
  // פונקציות חדשות לניהול מיפויי קטגוריות
  const addCategoryMapping = (mapping: Omit<CategoryMapping, "id">) => {
    dispatch({ type: "ADD_CATEGORY_MAPPING", payload: mapping });
  };
  
  const updateCategoryMapping = (mapping: CategoryMapping) => {
    dispatch({ type: "UPDATE_CATEGORY_MAPPING", payload: mapping });
  };
  
  const deleteCategoryMapping = (description: string) => {
    dispatch({ type: "DELETE_CATEGORY_MAPPING", payload: description });
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addTransactions,
        addCategory,
        updateCategory,
        deleteCategory,
        setBudget,
        deleteBudget,
        addImportFormat,
        updateImportFormat,
        deleteImportFormat,
        addCategoryMapping,
        updateCategoryMapping,
        deleteCategoryMapping
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance חייב להיות בתוך FinanceProvider");
  }
  return context;
};
