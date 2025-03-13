
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFinancialRecommendationsResult } from "@/components/transactions/useFinancialRecommendations";
import { Badge } from "@/components/ui/badge";
import { LightbulbIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/finance/useCurrencyFormatter";

interface RecommendationsCardProps {
  recommendations: UseFinancialRecommendationsResult;
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ 
  recommendations 
}) => {
  const { formatCurrency } = useCurrencyFormatter();
  
  if (!recommendations.hasRecommendations) {
    return null;
  }
  
  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  };
  
  const priorityLabels = {
    high: "גבוהה",
    medium: "בינונית",
    low: "נמוכה"
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <LightbulbIcon className="ml-2 h-5 w-5 text-yellow-500" />
          המלצות לשיפור המצב הפיננסי
        </CardTitle>
        <CardDescription>
          פוטנציאל חיסכון כולל: {formatCurrency(recommendations.savingsPotential)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {recommendations.recommendations.map((recommendation, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                <Badge className={priorityColors[recommendation.priority]}>
                  עדיפות {priorityLabels[recommendation.priority]}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-3">{recommendation.description}</p>
              <div className="flex items-center">
                {recommendation.priority === "high" ? (
                  <TrendingDownIcon className="h-4 w-4 text-red-500 ml-1" />
                ) : (
                  <TrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                )}
                <span className="text-sm font-medium">
                  פוטנציאל חיסכון: {formatCurrency(recommendation.savingPotential)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
