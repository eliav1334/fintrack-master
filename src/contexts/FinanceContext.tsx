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
        
        // נקה את כל עסקאות הכנסה חודשיות קבועות לפני הטעינה
        const cleanedTransactions = parsedState.transactions ? 
          parsedState.transactions.filter((tx: Transaction) => 
            !(tx.type === "income" && 
              tx.amount === 16000 && 
              tx.description === "משכורת חודשית קבועה")
          ) : [];
        
        // טען את העסקאות המנוקות
        if (cleanedTransactions.length > 0) {
          dispatch({ type: "ADD_TRANSACTIONS", payload: cleanedTransactions });
        }
        
        if (parsedState.budgets) {
          parsedState.budgets.forEach((budget: Budget) => {
            dispatch({ type: "SET_BUDGET", payload: budget });
          });
        }
        if (parsedState.categoryMappings) {
          dispatch({ 
            type: "ADD_TRANSACTIONS", 
            payload: [] 
          });
        }
      } catch (error) {
        console.error("שגיאה בטעינת נתונים מהאחסון המקומי:", error);
      }
    }
    
    // הפעלת בדיקת ההכנסות החודשיות לאחר טעינת הנתונים (רק פעם אחת)
    const checkTimeout = setTimeout(() => {
      // מכיוון שאיפסנו את כל ההכנסות הקבועות, נוסיף אותן מחדש באופן מסודר
      addMonthlyIncomes();
    }, 500);
    
    return () => clearTimeout(checkTimeout);
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
   * פונקציה חדשה ומשופרת להוספת הכנסות חודשיות קבועות
   * מוסיפה בדיוק הכנסה אחת לכל חודש בסכום של 16,000 ₪
   */
  const addMonthlyIncomes = () => {
    const currentDate = new Date();
    
    // יצירת מערך של 7 החודשים האחרונים
    const last7Months = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return format(date, "yyyy-MM");
    });
    
    // הכנת עסקאות חדשות להוספה
    const newTransactions: Transaction[] = [];
    
    // עבור כל אחד מ-7 החודשים האחרונים, הוסף הכנסה חודשית
    last7Months.forEach(month => {
      const [year, monthNum] = month.split("-");
      
      // יצירת תאריך לתחילת החודש
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      
      const monthlyIncome: Transaction = {
        id: generateId(`tx-monthly-${month}`), // מזהה ייחודי עבור כל חודש
        description: "משכורת חודשית קבועה",
        amount: 16000,
        type: "income",
        date: format(date, "yyyy-MM-dd"),
        categoryId: "",
        notes: `הכנסה חודשית קבועה לחודש ${month}`
      };
      
      // הוספה למערך העסקאות החדשות
      newTransactions.push(monthlyIncome);
    });
    
    // הוספת כל העסקאות החדשות בפעולה אחת
    if (newTransactions.length > 0) {
      dispatch({ type: "ADD_TRANSACTIONS", payload: newTransactions });
      console.log(`נוספו ${newTransactions.length} עסקאות הכנסה חודשית קבועה`);
    }
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
