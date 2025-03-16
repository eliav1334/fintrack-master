
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToBudgets = () => {
    navigate('/budgets');
  };

  return (
    <header className="border-b border-border py-4 px-6 bg-card">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">ניהול תקציב אישי</h1>
        <Button 
          variant="outline" 
          onClick={handleNavigateToBudgets}
          className="hidden sm:flex"
        >
          תקציבים
        </Button>
      </div>
    </header>
  );
};

export default Header;
