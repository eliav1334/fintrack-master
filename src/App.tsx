
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/contexts/FinanceContext";
import Index from "./pages/Index";
import Budgets from "./pages/Budgets";
import NotFound from "./pages/NotFound";
import "./App.css";

// יצירת לקוח שאילתות חדש
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <FinanceProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/budgets" element={<Budgets />} />
              {/* יש להוסיף נתיבים מותאמים אישית מעל נתיב ה-"*" שתופס הכל */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </FinanceProvider>
    </QueryClientProvider>
  );
};

export default App;
