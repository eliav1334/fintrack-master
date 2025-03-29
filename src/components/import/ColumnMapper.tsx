import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColumnMapperProps {
  headers: string[];
  mappings: Record<string, string>;
  onMappingChange: (mappings: Record<string, string>) => void;
  onPreviewClick: () => void;
}

const REQUIRED_FIELDS = [
  { id: 'date', label: 'תאריך' },
  { id: 'amount', label: 'סכום' },
  { id: 'description', label: 'תיאור' },
];

const OPTIONAL_FIELDS = [
  { id: 'category', label: 'קטגוריה' },
  { id: 'type', label: 'סוג' },
  { id: 'status', label: 'סטטוס' },
];

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  headers,
  mappings,
  onMappingChange,
  onPreviewClick,
}) => {
  const { toast } = useToast();

  const handleMappingChange = (field: string, value: string) => {
    onMappingChange({
      ...mappings,
      [field]: value,
    });
  };

  const handlePreviewClick = () => {
    const requiredFields = ['description', 'amount', 'date', 'category', 'type', 'status'];
    const missingMappings = requiredFields.filter(field => !mappings[field]);
    
    if (missingMappings.length > 0) {
      toast({
        variant: "destructive",
        title: "מיפוי חסר",
        description: `אנא מפה את כל השדות הנדרשים לפני הייבוא`,
      });
      return;
    }
    
    onPreviewClick();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>מיפוי עמודות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">שדות חובה</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REQUIRED_FIELDS.map(({ id, label }) => (
                <div key={id} className="space-y-2">
                  <label className="text-sm font-medium">{label}</label>
                  <Select
                    value={mappings[id] || ''}
                    onValueChange={(value) => handleMappingChange(id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`בחר עמודה ל${label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">שדות אופציונליים</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OPTIONAL_FIELDS.map(({ id, label }) => (
                <div key={id} className="space-y-2">
                  <label className="text-sm font-medium">{label}</label>
                  <Select
                    value={mappings[id] || ''}
                    onValueChange={(value) => handleMappingChange(id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`בחר עמודה ל${label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ללא מיפוי</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handlePreviewClick}
            className="mt-6"
          >
            <FileText className="mr-2 h-4 w-4" />
            הצג תצוגה מקדימה
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
