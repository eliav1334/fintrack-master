
import { Transaction, TransactionType } from "@/types";
import { useMemo } from "react";

interface RecommendationResult {
  // התוצאה הסופית של ההמלצה
  title: string;
  description: string;
  savingPotential: number;
  priority: "low" | "medium" | "high";
}

export interface UseFinancialRecommendationsResult {
  recommendations: RecommendationResult[];
  hasRecommendations: boolean;
  savingsPotential: number;
}

/**
 * הוק שמספק המלצות פיננסיות לפי נתוני העסקאות
 */
export const useFinancialRecommendations = (
  transactions: Transaction[],
  monthlyIncome: number,
  monthlyExpenses: number
): UseFinancialRecommendationsResult => {
  const recommendations = useMemo(() => {
    const result: RecommendationResult[] = [];
    
    // חישוב המאזן החודשי
    const monthlyBalance = monthlyIncome - monthlyExpenses;
    const isNegativeBalance = monthlyBalance < 0;
    
    // מיפוי קטגוריות הוצאה נפוצות (לטובת מציאת דפוסי הוצאה)
    const expensesByCategory: Record<string, { total: number; count: number }> = {};
    
    transactions
      .filter(tx => tx.type === "expense")
      .forEach(tx => {
        if (!expensesByCategory[tx.categoryId]) {
          expensesByCategory[tx.categoryId] = { total: 0, count: 0 };
        }
        expensesByCategory[tx.categoryId].total += tx.amount;
        expensesByCategory[tx.categoryId].count += 1;
      });
    
    // המלצות במקרה של מאזן שלילי
    if (isNegativeBalance) {
      result.push({
        title: "הפחתת הוצאות לא חיוניות",
        description: "זיהינו שהמאזן החודשי שלך שלילי. כדאי לשקול צמצום הוצאות בקטגוריות לא חיוניות.",
        savingPotential: Math.abs(monthlyBalance) * 0.4, // הנחה שאפשר לחסוך 40% מהגרעון
        priority: "high"
      });
      
      // בדיקת קטגוריות עם הוצאות גבוהות
      const categoryEntries = Object.entries(expensesByCategory);
      const sortedCategories = categoryEntries.sort((a, b) => b[1].total - a[1].total);
      
      // המלצות לקיצוץ בקטגוריות המובילות
      const topExpenseCategories = sortedCategories.slice(0, 3);
      topExpenseCategories.forEach(([categoryId, data]) => {
        // אם ההוצאה בקטגוריה היא לפחות 15% מסך ההוצאות
        if (data.total / monthlyExpenses > 0.15) {
          result.push({
            title: `בחינה מחדש של הוצאות בקטגוריה ${categoryId}`,
            description: `הוצאות בקטגוריה זו מהוות חלק משמעותי מהתקציב החודשי (${Math.round(data.total / monthlyExpenses * 100)}%). שקול לצמצם הוצאות אלו.`,
            savingPotential: data.total * 0.2, // הנחה שאפשר לחסוך 20% בקטגוריה
            priority: "medium"
          });
        }
      });
    }
    
    // המלצות כלליות לחיסכון
    // המלצה לתשלומים קבועים
    const recurringPayments = findRecurringPayments(transactions);
    if (recurringPayments.length > 0) {
      const totalRecurring = recurringPayments.reduce((sum, tx) => sum + tx.amount, 0);
      result.push({
        title: "בחינת תשלומים קבועים",
        description: `זיהינו ${recurringPayments.length} תשלומים קבועים בסך ${totalRecurring.toFixed(2)}₪. בדוק אם יש מנויים שאינך משתמש בהם.`,
        savingPotential: totalRecurring * 0.15, // הנחה שאפשר לחסוך 15% מהתשלומים הקבועים
        priority: isNegativeBalance ? "high" : "medium"
      });
    }
    
    // המלצות להגדלת הכנסה אם ההוצאות גבוהות מהכנסות
    if (isNegativeBalance) {
      result.push({
        title: "הגדלת הכנסות",
        description: "שקול אפשרויות להגדלת הכנסה, למשל עבודה נוספת, העלאת מחירים (לעצמאים) או מציאת מקורות הכנסה פאסיביים.",
        savingPotential: Math.abs(monthlyBalance) * 0.3, // פוטנציאל לכיסוי 30% מהגרעון
        priority: "medium"
      });
    }
    
    // חישוב הפוטנציאל הכולל לחיסכון
    const totalSavingsPotential = result.reduce((sum, rec) => sum + rec.savingPotential, 0);
    
    return {
      recommendations: result,
      hasRecommendations: result.length > 0,
      savingsPotential: totalSavingsPotential
    };
  }, [transactions, monthlyIncome, monthlyExpenses]);
  
  return recommendations;
};

/**
 * פונקציית עזר למציאת תשלומים קבועים
 */
function findRecurringPayments(transactions: Transaction[]): Transaction[] {
  const descriptionMap: Map<string, number> = new Map();
  
  // ספירת עסקאות עם תיאורים דומים
  transactions
    .filter(tx => tx.type === "expense")
    .forEach(tx => {
      const normalizedDesc = tx.description.toLowerCase().trim();
      descriptionMap.set(normalizedDesc, (descriptionMap.get(normalizedDesc) || 0) + 1);
    });
  
  // זיהוי עסקאות שמופיעות לפחות פעמיים
  const recurringDescriptions = Array.from(descriptionMap.entries())
    .filter(([_, count]) => count >= 2)
    .map(([desc, _]) => desc);
  
  // החזרת העסקאות המקוריות שתואמות לתיאורים החוזרים
  return transactions.filter(tx => 
    recurringDescriptions.includes(tx.description.toLowerCase().trim()) && 
    tx.type === "expense"
  );
}
