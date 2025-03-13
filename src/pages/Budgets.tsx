
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Budget, CategoryType } from "@/types";
import { PlusCircle, ArrowLeft, FolderPlus } from "lucide-react";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetList from "@/components/budgets/BudgetList";
import CategoryForm from "@/components/budgets/CategoryForm";

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

const Budgets = () => {
  const { state, setBudget, deleteBudget, addCategory } = useFinance();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("כל הקטגוריות");
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
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

  // משופר: טיפול בגלילה אופקית עם גלגלת העכבר - עם רגישות מותאמת
  const handleWheel = (e: React.WheelEvent) => {
    if (tabsContainerRef.current) {
      e.preventDefault();
      
      // הגדרת רגישות הגלילה - ערך נמוך יותר לגלילה יותר איטית ומדויקת
      const sensitivity = 0.5; 
      
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="relative overflow-hidden border rounded-md">
            <div 
              ref={tabsContainerRef}
              className="overflow-x-auto pb-2" 
              style={{ scrollBehavior: 'smooth' }}
              onWheel={handleWheel}
            >
              <TabsList className="inline-flex w-max py-2 px-4 bg-transparent">
                {groupNames.map(groupName => (
                  <TabsTrigger 
                    key={groupName} 
                    value={groupName} 
                    className="min-w-fit mx-1"
                    data-value={groupName}
                  >
                    {groupName}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {/* חצים לגלילה בטלפונים */}
            <div className="absolute left-0 top-0 bottom-0 flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => {
                  if (tabsContainerRef.current) {
                    tabsContainerRef.current.scrollLeft -= 100;
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
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => {
                  if (tabsContainerRef.current) {
                    tabsContainerRef.current.scrollLeft += 100;
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 transform rotate-180" />
              </Button>
            </div>
          </div>
          
          {groupNames.map(groupName => (
            <TabsContent key={groupName} value={groupName}>
              <BudgetList 
                budgets={filteredBudgets}
                categories={state.categories}
                calculateExpenses={calculateExpenses}
                onDelete={deleteBudget}
                onSubmit={setBudget}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Budgets;
