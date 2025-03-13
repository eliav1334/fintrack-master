
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  value: string;
  changeValue: string;
  changeDirection: "up" | "down" | "none";
  iconComponent: ReactNode;
}

const SummaryCard = ({
  title,
  description,
  icon,
  value,
  changeValue,
  changeDirection,
  iconComponent,
}: SummaryCardProps) => {
  return (
    <Card className="finance-card finance-card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          {icon}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-2 text-sm">
          {iconComponent}
          <span
            className={cn(
              changeDirection === "up" ? "text-finance-income" : 
              changeDirection === "down" ? "text-finance-expense" : ""
            )}
          >
            {changeValue}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
