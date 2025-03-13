
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

const ChartCard = ({ title, description, children, className }: ChartCardProps) => {
  return (
    <Card className={`finance-card ${className || ""}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
