
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFinance } from "@/contexts/FinanceContext";
import { Tabs } from "@/components/ui/tabs";
import { useFinanceDashboard } from "@/hooks/useFinanceDashboard";
import { Header, TabsNavigation, TabContent } from "@/components/pages/index";

const Index = () => {
  const { state } = useFinance();
  const navigate = useNavigate();
  const location = useLocation();
  
  // שימוש ב-URLSearchParams כדי לנהל את מצב הטאב בתוך ה-URL, מבלי לרענן את הדף במעבר בין טאבים
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || "dashboard");
  const [selectedDate] = useState(new Date());
  
  // הוק לקבלת נתוני דשבורד
  const { stats } = useFinanceDashboard(selectedDate);

  // עדכון ה-URL כאשר הטאב משתנה, אבל ללא ריענון הדף
  useEffect(() => {
    const newParams = new URLSearchParams(location.search);
    if (activeTab !== "dashboard") {
      newParams.set('tab', activeTab);
    } else {
      newParams.delete('tab');
    }
    
    const newSearch = newParams.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    
    // עדכון של ה-URL מבלי לרענן את הדף
    window.history.replaceState(null, '', newPath);
  }, [activeTab, location.pathname, location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Sample recommendations data
  const recommendations = {
    recommendations: [
      {
        title: "הפחתת הוצאות לא חיוניות",
        description: "זיהינו שההוצאות בקטגוריות כמו בילויים ותחביבים גבוהות. שקול להפחית הוצאות אלו.",
        savingPotential: 1500,
        priority: "medium" as const
      },
      {
        title: "תשלומים קבועים",
        description: "זיהינו מספר תשלומים קבועים שכדאי לבדוק אם הם הכרחיים, כמו מנויים שאינם בשימוש.",
        savingPotential: 800,
        priority: "high" as const
      }
    ],
    hasRecommendations: true,
    savingsPotential: 2300
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs 
          defaultValue="dashboard" 
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsNavigation activeTab={activeTab} />
          <TabContent activeTab={activeTab} stats={stats} recommendations={recommendations} />
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
