
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Budget, CategoryType } from "@/types";
import { PlusCircle, ArrowLeft, FolderPlus, FilePlus, FileText } from "lucide-react";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetList from "@/components/budgets/BudgetList";
import CategoryForm from "@/components/budgets/CategoryForm";
import { toast } from "sonner";

// הגדרת קבוצות קטגוריות
const CATEGORY_GROUPS = {
  "הכנסות": ["משכורת", "הכנסה"],
  "דיור": ["דירה", "משכנתא", "ארנונה", "חשמל", "גז", "מים"],
  "רכבים": ["רכב", "דלק", "חניה", "ביטוח רכב", "טיפולים", "צמיגים", "תאונות"],
  "מזון": ["מזון", "סופר", "מכולת", "מסעדות"],
  "תקשורת": ["סלולאר", "אינטרנט", "טלפון", "טלוויזיה"],
  "ביטוחים": ["ביטוח", "בריאות", "חיים"],
  "ילדים": ["ילדים", "מעונות", "צהרון", "חינוך"],
  "בנק": ["בנק", "עמלות", "חסכונות"],
  "אחר": []
};

// מערך התקציבים המוכנים מראש (מתוך התמונה שהועלתה)
const PREDEFINED_BUDGETS = [
  { name: "משכורת א", amount: 16000, type: "income" },
  { name: "משכורת ב", amount: 0, type: "income" },
  { name: "דלק", amount: 1200, type: "expense" },
  { name: "תשלומי חניה", amount: 100, type: "expense" },
  { name: "דוחות תנועה וחניה", amount: 100, type: "expense" },
  { name: "כבישי אגרה", amount: 100, type: "expense" },
  { name: "צמיגים", amount: 0, type: "expense" },
  { name: "תאונות", amount: 0, type: "expense" },
  { name: "טיפולים", amount: 600, type: "expense" },
  { name: "חידוש רישיון לרכב", amount: 0, type: "expense" },
  { name: "ביטוח חובה", amount: 0, type: "expense" },
  { name: "ביטוח צד ג' / מקיף", amount: 0, type: "expense" },
  { name: "סלקום TV+אינטרנט", amount: 240, type: "expense" },
  { name: "קו סלולאר - פלאפון", amount: 250, type: "expense" },
  { name: "נטספארק", amount: 54, type: "expense" },
  { name: "פסיכולוג", amount: 400, type: "expense" },
  { name: "תרופות", amount: 350, type: "expense" },
  { name: "שיניים", amount: 0, type: "expense" },
  { name: "ביטוח חיים", amount: 0, type: "expense" },
  { name: "ביטוח בריאות", amount: 0, type: "expense" },
  { name: "שירותי בריאות כללית", amount: 0, type: "expense" },
  { name: "ביטוח דירה/רכוש", amount: 0, type: "expense" },
  { name: "חשמל", amount: 1200, type: "expense" },
  { name: "משכנתא", amount: 0, type: "expense" },
  { name: "ארנונה", amount: 0, type: "expense" },
  { name: "מים וביוב", amount: 0, type: "expense" },
  { name: "גז", amount: 0, type: "expense" },
  { name: "סופר", amount: 4000, type: "expense" },
  { name: "מכולת", amount: 500, type: "expense" },
  { name: "מסעדות", amount: 800, type: "expense" },
  { name: "בית מלון", amount: 0, type: "expense" },
  { name: "הוצאת מזומן", amount: 800, type: "expense" },
  { name: "עמלות בנק", amount: 30, type: "expense" },
  { name: "עמלת כרטיס אשראי", amount: 12, type: "expense" },
  { name: "תוכנית חיסכון", amount: 2000, type: "expense" },
  { name: "חסכון ילדים", amount: 600, type: "expense" },
  { name: "פעילויות וחוגים", amount: 0, type: "expense" },
  { name: "מעונות", amount: 7000, type: "expense" },
  { name: "צהרון/מטפלת", amount: 4000, type: "expense" },
  { name: "ספרי לימוד/כתיבה", amount: 0, type: "expense" },
  { name: "מוצרי מזון/משחק", amount: 400, type: "expense" },
  { name: "אירועים", amount: 0, type: "expense" }
];

const Budgets = () => {
  const { state, setBudget, deleteBudget, addCategory } = useFinance();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("כל הקטגוריות");
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showImportSuccessToast, setShowImportSuccessToast] = useState(false);
  
  // חישוב סכום ההוצאות לפי קטגוריה וחודש
  const calculateExpenses = (categoryId: string) => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return state.transactions
      .filter(t => 
        t.categoryId === categoryId && 
        t.type === "expense" &&
        new Date(t.date) >= firstDay &&
        new Date(t.date) <= lastDay
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // חלוקת הקטגוריות לפי קבוצות
  const groupCategories = () => {
    const groups: Record<string, CategoryType[]> = {
      "כל הקטגוריות": state.categories.filter(cat => cat.type === "expense")
    };
    
    // מיון ראשוני לפי שם - כך שהקבוצות יהיו מסודרות אלפביתית
    const sortedCategories = [...state.categories].sort((a, b) => a.name.localeCompare(b.name));
    
    // הוספת כל קטגוריה לקבוצה המתאימה
    Object.keys(CATEGORY_GROUPS).forEach(groupName => {
      const keywords = CATEGORY_GROUPS[groupName as keyof typeof CATEGORY_GROUPS];
      
      // סינון הקטגוריות שמתאימות לקבוצה הנוכחית
      const categoriesInGroup = sortedCategories.filter(cat => {
        // בדיקה אם הקטגוריה היא מסוג הוצאה ואם היא מתאימה לאחת המילות המפתח
        if (cat.type !== "expense") return false;
        
        // אם זו קבוצת "אחר", נחזיר את כל הקטגוריות שלא נמצאו בקבוצות אחרות
        if (groupName === "אחר") {
          for (const otherGroup of Object.keys(CATEGORY_GROUPS)) {
            if (otherGroup === "אחר") continue;
            
            const otherKeywords = CATEGORY_GROUPS[otherGroup as keyof typeof CATEGORY_GROUPS];
            if (otherKeywords.some(kw => cat.name.includes(kw))) {
              return false;
            }
          }
          return true;
        }
        
        // בדיקה אם שם הקטגוריה מכיל אחת ממילות המפתח
        return keywords.some(keyword => cat.name.includes(keyword));
      });
      
      if (categoriesInGroup.length > 0) {
        groups[groupName] = categoriesInGroup;
      }
    });
    
    return groups;
  };

  const categoryGroups = groupCategories();
  const groupNames = Object.keys(categoryGroups);
  
  // סינון תקציבים לפי הקבוצה הנבחרת
  const getFilteredBudgets = () => {
    if (activeTab === "כל הקטגוריות") {
      return state.budgets;
    }
    
    const categoryIds = categoryGroups[activeTab]?.map(cat => cat.id) || [];
    return state.budgets.filter(budget => categoryIds.includes(budget.categoryId));
  };

  const filteredBudgets = getFilteredBudgets();
  const expenseCategories = state.categories.filter(cat => cat.type === "expense");

  // פונקציה להוספת התקציבים מוכנים מראש מהטבלה
  const importPredefinedBudgets = () => {
    let addedCount = 0;
    let updatedCount = 0;
    const existingBudgets = new Set(state.budgets.map(b => {
      const category = state.categories.find(c => c.id === b.categoryId);
      return category?.name;
    }));

    // מעבר על התקציבים המוכנים מראש
    PREDEFINED_BUDGETS.forEach(predefinedBudget => {
      // דילוג על תקציבים בסכום 0
      if (predefinedBudget.amount === 0) return;

      // חיפוש קטגוריה מתאימה
      const matchingCategory = state.categories.find(cat => 
        cat.name.trim() === predefinedBudget.name.trim() && 
        cat.type === predefinedBudget.type
      );

      if (matchingCategory) {
        // בדיקה אם כבר קיים תקציב לקטגוריה זו
        const budgetExists = existingBudgets.has(matchingCategory.name);

        if (!budgetExists) {
          // יצירת תקציב חדש
          setBudget({
            categoryId: matchingCategory.id,
            amount: predefinedBudget.amount,
            period: "monthly",
            startDate: new Date().toISOString()
          });
          addedCount++;
        } else {
          // עדכון תקציב קיים - במקרה זה נדלג כי אנחנו לא רוצים לדרוס תקציבים קיימים
          updatedCount++;
        }
      }
    });

    // הצגת הודעת הצלחה
    toast.success(
      `נוספו ${addedCount} תקציבים חדשים${updatedCount > 0 ? ` (${updatedCount} כבר קיימים)` : ''}`,
      {
        description: "התקציבים נוספו בהצלחה למערכת",
        duration: 4000,
      }
    );
    
    setShowImportSuccessToast(true);
  };

  // טיפול בגלילה אופקית עם גלגלת העכבר - עם רגישות מותאמת
  const handleWheel = (e: React.WheelEvent) => {
    if (tabsContainerRef.current) {
      e.preventDefault();
      
      // הגדרת רגישות הגלילה - ערך נמוך יותר לגלילה יותר איטית ומדויקת
      const sensitivity = 1.5; 
      
      // כיוון הגלילה מותאם לכיוון RTL עם מהירות מותאמת
      tabsContainerRef.current.scrollLeft -= e.deltaY * sensitivity;
      
      // הוספת תמיכה בגלילה אופקית ישירה (אם קיימת)
      if (e.deltaX !== 0) {
        tabsContainerRef.current.scrollLeft -= e.deltaX * sensitivity;
      }
    }
  };

  // התאמה של רוחב התצוגה כשהקומפוננטה נטענת
  useEffect(() => {
    // בדיקה אם קיים טאב פעיל ויש צורך לגלול אליו
    if (tabsContainerRef.current && activeTab) {
      const activeTabElement = document.querySelector(`[data-value="${activeTab}"]`);
      if (activeTabElement) {
        // מיקום הטאב הפעיל במרכז התצוגה
        const tabsWidth = tabsContainerRef.current.clientWidth;
        const tabPosition = (activeTabElement as HTMLElement).offsetLeft;
        const tabWidth = (activeTabElement as HTMLElement).clientWidth;
        
        tabsContainerRef.current.scrollLeft = tabPosition - (tabsWidth / 2) + (tabWidth / 2);
      }
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-6 bg-card">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ניהול תקציבים</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>חזרה לדף הבית</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">הגדרת ומעקב אחר תקציבים</h2>
          
          <div className="flex gap-4">
            {/* כפתור לייבוא תקציבים מוכנים מראש */}
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={importPredefinedBudgets}
            >
              <FileText className="h-5 w-5" />
              <span>ייבוא תקציבים מוכנים</span>
            </Button>
            
            {/* דיאלוג להוספת קטגוריה חדשה */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5" />
                  <span>קטגוריה חדשה</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>הוספת קטגוריה חדשה</DialogTitle>
                </DialogHeader>
                <CategoryForm onSubmit={addCategory} />
              </DialogContent>
            </Dialog>
            
            {/* דיאלוג להוספת תקציב חדש */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>תקציב חדש</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>הגדרת תקציב חדש</DialogTitle>
                </DialogHeader>
                <BudgetForm 
                  expenseCategories={expenseCategories} 
                  onSubmit={setBudget} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* טאבים לסינון לפי קבוצות קטגוריות עם גלילה משופרת */}
        <div className="relative mb-6 border rounded-lg overflow-hidden">
          <div 
            ref={tabsContainerRef}
            className="overflow-x-auto pb-2 pt-2 px-4 hide-scrollbar"
            style={{ scrollBehavior: 'smooth' }}
            onWheel={handleWheel}
          >
            <div className="flex gap-2 flex-nowrap min-w-max">
              {groupNames.map(groupName => (
                <button
                  key={groupName}
                  onClick={() => setActiveTab(groupName)}
                  className={`px-3 py-1 rounded-md whitespace-nowrap text-sm transition-colors
                    ${activeTab === groupName 
                      ? 'bg-primary text-primary-foreground font-medium' 
                      : 'bg-muted/40 hover:bg-muted text-foreground'
                    }`}
                  data-value={groupName}
                >
                  {groupName}
                </button>
              ))}
            </div>
          </div>
          
          {/* חצים לגלילה */}
          <div className="absolute left-0 top-0 bottom-0 flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
              onClick={() => {
                if (tabsContainerRef.current) {
                  tabsContainerRef.current.scrollLeft -= 150;
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute right-0 top-0 bottom-0 flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
              onClick={() => {
                if (tabsContainerRef.current) {
                  tabsContainerRef.current.scrollLeft += 150;
                }
              }}
            >
              <ArrowLeft className="h-4 w-4 transform rotate-180" />
            </Button>
          </div>
        </div>
        
        {/* תצוגת כל הקטגוריות יחד בדף אחד */}
        <div className="space-y-10">
          {Object.entries(categoryGroups).map(([groupName, categories]) => {
            // קבלת התקציבים המתאימים לקבוצה הנוכחית
            const categoryIds = categories.map(cat => cat.id);
            const budgetsInGroup = state.budgets.filter(budget => 
              categoryIds.includes(budget.categoryId)
            );
            
            if (budgetsInGroup.length === 0 && groupName !== "כל הקטגוריות") {
              return null; // לא נציג קבוצות ריקות
            }
            
            return (
              <div key={groupName} className="bg-card rounded-lg p-6 shadow-sm animate-fade-up">
                <h3 className="text-lg font-medium mb-4 border-b pb-2">
                  {groupName}
                  <span className="text-muted-foreground text-sm mr-2">
                    ({budgetsInGroup.length} תקציבים)
                  </span>
                </h3>
                
                {budgetsInGroup.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {budgetsInGroup.map(budget => {
                      const category = state.categories.find(c => c.id === budget.categoryId);
                      const expenses = calculateExpenses(budget.categoryId);
                      
                      return (
                        <div 
                          key={budget.id} 
                          className="bg-background border rounded-md p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{category?.name || 'קטגוריה לא ידועה'}</h4>
                              <p className="text-xs text-muted-foreground">
                                {budget.period === "monthly" && "תקציב חודשי"}
                                {budget.period === "yearly" && "תקציב שנתי"}
                                {budget.period === "weekly" && "תקציב שבועי"}
                                {budget.period === "daily" && "תקציב יומי"}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => deleteBudget(budget.id)}
                            >
                              <span className="sr-only">מחיקה</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className={expenses > budget.amount ? "text-destructive font-medium" : ""}>
                                {Math.min(Math.round((expenses / budget.amount) * 100), 100)}% מנוצל
                              </span>
                              <span className="font-medium">
                                {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(expenses)} / 
                                {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(budget.amount)}
                              </span>
                            </div>
                            
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  expenses > budget.amount 
                                    ? 'bg-destructive' 
                                    : expenses > budget.amount * 0.85 
                                      ? 'bg-amber-500' 
                                      : 'bg-primary'
                                }`}
                                style={{ width: `${Math.min(Math.round((expenses / budget.amount) * 100), 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">אין תקציבים בקטגוריה זו</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">הוספת תקציב חדש</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>הגדרת תקציב חדש</DialogTitle>
                        </DialogHeader>
                        <BudgetForm 
                          expenseCategories={expenseCategories} 
                          onSubmit={setBudget} 
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
