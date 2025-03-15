
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { CategoryType } from "@/types";
import { CirclePicker } from "react-color";
import { WalletIcon, CreditCard, DollarSign, PiggyBank, Wallet, Home, Car, Phone, Users, HeartPulse, ShoppingBag, FileText, Calculator } from "lucide-react";

interface CategoryFormProps {
  onSubmit: (category: Omit<CategoryType, "id">) => void;
  initialType?: "income" | "expense";
}

const CATEGORY_ICONS = [
  { name: "ארנק", icon: <Wallet className="h-4 w-4" /> },
  { name: "כרטיס אשראי", icon: <CreditCard className="h-4 w-4" /> },
  { name: "מטבע", icon: <DollarSign className="h-4 w-4" /> },
  { name: "חיסכון", icon: <PiggyBank className="h-4 w-4" /> },
  { name: "בית", icon: <Home className="h-4 w-4" /> },
  { name: "רכב", icon: <Car className="h-4 w-4" /> },
  { name: "טלפון", icon: <Phone className="h-4 w-4" /> },
  { name: "ילדים", icon: <Users className="h-4 w-4" /> },
  { name: "בריאות", icon: <HeartPulse className="h-4 w-4" /> },
  { name: "מזון", icon: <ShoppingBag className="h-4 w-4" /> },
  { name: "מסמך", icon: <FileText className="h-4 w-4" /> },
  { name: "חישוב", icon: <Calculator className="h-4 w-4" /> },
  { name: "תשלום", icon: <DollarSign className="h-4 w-4" /> },
];

const CATEGORY_COLORS = [
  "#f87171", "#fb7185", "#f472b6", "#e879f9", 
  "#c084fc", "#a78bfa", "#818cf8", "#60a5fa", 
  "#38bdf8", "#22d3ee", "#2dd4bf", "#34d399", 
  "#4ade80", "#a3e635", "#facc15", "#fbbf24", 
  "#fb923c", "#f97316", "#ef4444", "#9ca3af"
];

const CategoryForm = ({ onSubmit, initialType }: CategoryFormProps) => {
  const [newCategory, setNewCategory] = useState<Omit<CategoryType, "id">>({
    name: "",
    type: initialType || "expense",
    color: "#60a5fa",
    icon: "ארנק"
  });
  
  // עדכון ערך ברירת המחדל אם יש שינוי בפרופס
  useEffect(() => {
    if (initialType) {
      setNewCategory(prev => ({
        ...prev,
        type: initialType
      }));
    }
  }, [initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name) return;
    
    onSubmit(newCategory);
    
    setNewCategory({
      name: "",
      type: initialType || "expense",
      color: "#60a5fa",
      icon: "ארנק"
    });
  };

  const getIconComponent = (iconName: string) => {
    const found = CATEGORY_ICONS.find(icon => icon.name === iconName);
    return found ? found.icon : <Wallet className="h-4 w-4" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">שם הקטגוריה</Label>
        <Input
          id="name"
          value={newCategory.name}
          onChange={e => setNewCategory({...newCategory, name: e.target.value})}
          placeholder="שם הקטגוריה"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">סוג</Label>
        <Select 
          value={newCategory.type} 
          onValueChange={value => setNewCategory({...newCategory, type: value as "income" | "expense"})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">הכנסה</SelectItem>
            <SelectItem value="expense">הוצאה</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>צבע</Label>
        <div className="py-2">
          <CirclePicker 
            colors={CATEGORY_COLORS}
            color={newCategory.color}
            onChange={(color) => setNewCategory({...newCategory, color: color.hex})}
            width="100%"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>אייקון</Label>
        <div className="grid grid-cols-4 gap-2 py-2">
          {CATEGORY_ICONS.map((icon) => (
            <Button
              key={icon.name}
              type="button"
              variant={newCategory.icon === icon.name ? "default" : "outline"}
              className="flex items-center justify-center p-2"
              onClick={() => setNewCategory({...newCategory, icon: icon.name})}
            >
              {icon.icon}
            </Button>
          ))}
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">ביטול</Button>
        </DialogClose>
        <Button type="submit">שמור</Button>
      </DialogFooter>
    </form>
  );
};

export default CategoryForm;
