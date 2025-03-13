import React, { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { FileImportFormat, Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { parseFile } from "@/utils/fileParser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, FileText, Tabs, TabsContent, TabsList, TabsTrigger, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import ImportHistory from "./ImportHistory";

const FileImport = () => {
  const { state, addTransactions, addImportFormat } = useFinance();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"import" | "history">("import");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [previewData, setPreviewData] = useState<Omit<Transaction, "id">[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showNewFormatDialog, setShowNewFormatDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cardFilter, setCardFilter] = useState<string[]>([]);
  const [cardNumbersInput, setCardNumbersInput] = useState<string>("");
  const [extractedCardNumbers, setExtractedCardNumbers] = useState<string[]>([]);
  const [selectedCardNumbers, setSelectedCardNumbers] = useState<string[]>([]);
  const [showCardFilterDialog, setShowCardFilterDialog] = useState<boolean>(false);
  
  const [newFormat, setNewFormat] = useState<{
    name: string;
    mapping: {
      date: string;
      amount: string;
      description: string;
      type?: string;
      category?: string;
      cardNumber?: string;
    };
    dateFormat: string;
    delimiter?: string;
    typeIdentifier: {
      column: string;
      incomeValues: string[];
      expenseValues: string[];
    };
  }>({
    name: "",
    mapping: {
      date: "",
      amount: "",
      description: "",
      type: "",
      category: "",
      cardNumber: "",
    },
    dateFormat: "YYYY-MM-DD",
    delimiter: ",",
    typeIdentifier: {
      column: "",
      incomeValues: [],
      expenseValues: [],
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      if (!['csv', 'xlsx', 'xls'].includes(fileExt || '')) {
        setErrorMessage("סוג קובץ לא נתמך. אנא השתמש בקובץ CSV או אקסל (xlsx/xls)");
        return;
      }
      
      setSelectedFile(file);
      setErrorMessage(null);
      setPreviewData([]);
      setShowPreview(false);
      
      setCardNumbersInput("");
      setExtractedCardNumbers([]);
      setSelectedCardNumbers([]);
      
      if (selectedFormatId) {
        const format = state.importFormats.find(f => f.id === selectedFormatId);
        if (format) {
          await extractCardNumbersFromFile(file, format);
        }
      }
    }
  };

  const handleFormatChange = async (value: string) => {
    setSelectedFormatId(value);
    
    if (selectedFile) {
      const format = state.importFormats.find(f => f.id === value);
      if (format) {
        await extractCardNumbersFromFile(selectedFile, format);
      }
    }
  };

  const extractCardNumbersFromFile = async (file: File, format: FileImportFormat) => {
    try {
      setImportProgress(10);
      
      const result = await parseFile(file, format);
      
      if (result.success && result.data && result.data.length > 0) {
        const uniqueCardNumbers = new Set<string>();
        
        result.data.forEach(tx => {
          if (tx.cardNumber) {
            uniqueCardNumbers.add(tx.cardNumber);
          }
        });
        
        const cardNumbers = Array.from(uniqueCardNumbers);
        console.log("Extracted card numbers:", cardNumbers);
        
        if (cardNumbers.length > 0) {
          setExtractedCardNumbers(cardNumbers);
          setShowCardFilterDialog(true);
        }
      }
      
      setImportProgress(0);
    } catch (error) {
      console.error("Error extracting card numbers:", error);
      setImportProgress(0);
    }
  };

  const handleCardFilterChange = (cardNumber: string, checked: boolean) => {
    if (checked) {
      setSelectedCardNumbers(prev => [...prev, cardNumber]);
    } else {
      setSelectedCardNumbers(prev => prev.filter(num => num !== cardNumber));
    }
  };

  const applyCardFilter = () => {
    setCardFilter(selectedCardNumbers);
    setShowCardFilterDialog(false);
    
    if (selectedCardNumbers.length > 0) {
      toast({
        title: "סינון הוגדר",
        description: `יבוצע סינון לפי ${selectedCardNumbers.length} מספרי כרטיסים`,
      });
    } else {
      toast({
        title: "סינון בוטל",
        description: "יבואו כל העסקאות ללא סינון",
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "שגיאה",
        description: "אנא בחר קובץ לייבוא",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFormatId) {
      toast({
        title: "שגיאה",
        description: "אנא בחר פורמט ייבוא",
        variant: "destructive",
      });
      return;
    }

    const format = state.importFormats.find((f) => f.id === selectedFormatId);
    if (!format) {
      toast({
        title: "שגיאה",
        description: "פורמט הייבוא לא נמצא",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(10);
    setErrorMessage(null);

    try {
      setImportProgress(30);
      console.log("Parsing file:", selectedFile.name, "with format:", format.name, "card filter:", cardFilter);
      const result = await parseFile(selectedFile, format, cardFilter.length > 0 ? cardFilter : undefined);
      setImportProgress(70);

      if (!result.success || !result.data) {
        setErrorMessage(result.error || "הניתוח נכשל");
        toast({
          title: "שגיאה",
          description: result.error || "הניתוח נכשל",
          variant: "destructive",
        });
        setIsImporting(false);
        setImportProgress(0);
        return;
      }

      console.log("Successfully parsed file, found transactions:", result.data.length);
      const now = new Date().toISOString();
      const dataWithCreatedAt = result.data.map(tx => ({
        ...tx,
        createdAt: now
      }));
      setPreviewData(dataWithCreatedAt);
      setShowPreview(true);
      setImportProgress(100);
    } catch (error) {
      console.error("Error importing file:", error);
      const errorMessage = error instanceof Error ? error.message : "אירעה שגיאה בלתי צפויה";
      setErrorMessage(errorMessage);
      toast({
        title: "שגיאה",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const confirmImport = () => {
    if (previewData.length === 0) {
      toast({
        title: "שגיאה",
        description: "אין נתונים לייבוא",
        variant: "destructive",
      });
      return;
    }

    try {
      addTransactions(previewData);
      toast({
        title: "הצלחה",
        description: `יובאו ${previewData.length} עסקאות בהצלחה`,
      });
      
      setSelectedFile(null);
      setPreviewData([]);
      setShowPreview(false);
      setImportProgress(0);
      setCardFilter([]);
      setSelectedCardNumbers([]);
      
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
      
      setActiveTab("history");
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "ייבוא העסקאות נכשל",
        variant: "destructive",
      });
    }
  };

  const cancelImport = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setImportProgress(0);
    setCardFilter([]);
    setSelectedCardNumbers([]);
    
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleNewFormatChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: string,
    subField?: string
  ) => {
    const { name, value } = e.target;
    
    if (section && subField) {
      setNewFormat((prev) => {
        const updated = { ...prev };
        if (section === "mapping" && updated.mapping) {
          updated.mapping = {
            ...updated.mapping,
            [subField]: value,
          };
        } else if (section === "typeIdentifier" && updated.typeIdentifier) {
          updated.typeIdentifier = {
            ...updated.typeIdentifier,
            [subField]: value,
          };
        }
        return updated;
      });
    } else if (section) {
      setNewFormat((prev) => ({
        ...prev,
        [section]: value,
      }));
    } else {
      setNewFormat((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayChange = (
    value: string,
    section: string,
    field: string
  ) => {
    const values = value.split(",").map((v) => v.trim()).filter((v) => v);
    
    setNewFormat((prev) => {
      if (section === "typeIdentifier") {
        return {
          ...prev,
          typeIdentifier: {
            ...prev.typeIdentifier,
            [field]: values,
          },
        };
      }
      return prev;
    });
  };

  const addNewFormat = () => {
    if (!newFormat.name.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא ה��ן שם לפורמט",
        variant: "destructive",
      });
      return;
    }
    
    if (!newFormat.mapping.date || !newFormat.mapping.amount || !newFormat.mapping.description) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל שדות המיפוי הנדרשים",
        variant: "destructive",
      });
      return;
    }
    
    try {
      addImportFormat(newFormat);
      toast({
        title: "הצלחה",
        description: "פורמט ייבוא חדש נוסף בהצלחה",
      });
      
      setNewFormat({
        name: "",
        mapping: {
          date: "",
          amount: "",
          description: "",
          type: "",
          category: "",
          cardNumber: "",
        },
        dateFormat: "YYYY-MM-DD",
        delimiter: ",",
        typeIdentifier: {
          column: "",
          incomeValues: [],
          expenseValues: [],
        },
      });
      setShowNewFormatDialog(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "הוספת הפורמט החדש נכשלה",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(value);
  };

  return (
    <div className="animate-fade-in p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-6">ייבוא עסקאות</h1>

      <div className="mb-6">
        <div className="flex items-center border-b pb-2 mb-4">
          <Button
            variant={activeTab === "import" ? "default" : "ghost"}
            className="ml-4"
            onClick={() => setActiveTab("import")}
          >
            <Upload className="h-4 w-4 ml-2" />
            ייבוא חדש
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
          >
            <FileText className="h-4 w-4 ml-2" />
            היסטוריית ייבוא
          </Button>
        </div>
      </div>

      {activeTab === "import" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="finance-card finance-card-hover">
            <CardHeader>
              <CardTitle>העלאת קובץ</CardTitle>
              <CardDescription>
                ייבוא עסקאות מקובץ CSV או Excel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">בחר קובץ</Label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-10 w-10 text-gray-400" />
                    <Label
                      htmlFor="file-upload"
                      className="text-sm text-primary cursor-pointer hover:underline"
                    >
                      {selectedFile ? selectedFile.name : "לחץ לבחירת קובץ"}
                    </Label>
                    <p className="text-xs text-gray-500">
                      פורמטים נתמכים: CSV, Excel (.xlsx, .xls)
                    </p>
                  </div>
                </div>
                
                {errorMessage && (
                  <div className="bg-destructive/15 p-3 rounded-md flex items-start mt-2">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 ml-2 mt-0.5" />
                    <span className="text-sm text-destructive">{errorMessage}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="format">פורמט ייבוא</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => setShowNewFormatDialog(true)}
                  >
                    + הוסף פורמט חדש
                  </Button>
                </div>
                <Select value={selectedFormatId} onValueChange={handleFormatChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר פורמט" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.importFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {cardFilter.length > 0 && (
                <div className="p-3 bg-primary/10 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">סינון לפי כרטיסי אשראי:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowCardFilterDialog(true)}
                    >
                      שנה
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cardFilter.map((card) => (
                      <span key={card} className="px-2 py-1 bg-primary/20 text-xs rounded-full">
                        {card}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={!selectedFile || !selectedFormatId || isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    מייבא...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    ייבא עסקאות
                  </>
                )}
              </Button>

              {isImporting && (
                <Progress value={importProgress} className="h-2" />
              )}
            </CardContent>
          </Card>

          <Card className="finance-card finance-card-hover">
            <CardHeader>
              <CardTitle>הוראות ייבוא</CardTitle>
              <CardDescription>
                למד כיצד להכין את הקובץ לייבוא
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">דרישות פורמט הקובץ</h3>
                <ul className="list-disc pr-5 text-sm space-y-1 text-right">
                  <li>השתמש בפורמט CSV או Excel (xlsx, xls)</li>
                  <li>כותרות העמודות צריכות להיות בשורה הראשונה</li>
                  <li>עמודות חובה: תאריך, סכום, תיאור</li>
                  <li>עמודות אופציונליות: סוג, קטגוריה, מספר כרטיס</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">פורמט העמודות</h3>
                <ul className="list-disc pr-5 text-sm space-y-1 text-right">
                  <li>
                    <strong>תאריך:</strong> השתמש בפורמט תאריך עקבי (לדוגמה, DD/MM/YYYY)
                  </li>
                  <li>
                    <strong>סכום:</strong> ערכים מספריים (חיובי להכנסה, שלילי להוצאה)
                  </li>
                  <li>
                    <strong>סוג:</strong> טקסט המציין את סוג העסקה (לדוגמה, "הכנסה", "הוצאה")
                  </li>
                  <li>
                    <strong>מספר כרטיס:</strong> עמודה המכילה את מספר כרטיס האשראי או מזהה אחר
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">סינון לפי כרטיס אשראי</h3>
                <ul className="list-disc pr-5 text-sm space-y-1 text-right">
                  <li>ניתן לסנן עסקאות לפי מספרי כרטיסי אשראי ספציפיים</li>
                  <li>בחר כרטיסים מהרשימה לאחר בחירת קובץ</li>
                  <li>מערכת הסינון תציג רק עסקאות מהכרטיסים שנבחרו</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">טיפים</h3>
                <ul className="list-disc pr-5 text-sm space-y-1 text-right">
                  <li>עבור קבצי אקסל מבנקים ישראליים, השתמש בפורמט "אקסל בנק ישראלי"</li>
                  <li>צפה בנתונים לפני אישור הייבוא</li>
                  <li>הסכומים מזוהים אוטומטית כהכנסה או הוצאה לפי הערך או עמודת הסוג</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <ImportHistory />
      )}

      <Dialog open={showCardFilterDialog} onOpenChange={setShowCardFilterDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>סינון לפי כרטיסי אשראי</DialogTitle>
            <DialogDescription>
              בחר את מספרי כרטיסי האשראי שברצונך לייבא מהם עסקאות
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {extractedCardNumbers.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm">מספרי כרטיסי אשראי שזוהו בקובץ:</p>
                <div className="space-y-2 border rounded-md p-3">
                  {extractedCardNumbers.map((cardNumber) => (
                    <div key={cardNumber} className="flex items-center space-x-2 pl-2 ml-2">
                      <Checkbox 
                        id={`card-${cardNumber}`}
                        checked={selectedCardNumbers.includes(cardNumber)}
                        onCheckedChange={(checked) => handleCardFilterChange(cardNumber, checked === true)}
                      />
                      <Label htmlFor={`card-${cardNumber}`} className="text-sm cursor-pointer">
                        {cardNumber}
                      </Label>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end pt-2">
                  <p className="text-xs text-gray-500">
                    נבחרו {selectedCardNumbers.length} מתוך {extractedCardNumbers.length} כרטיסים
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-gray-500">לא זוהו מספרי כרטיסי אשראי בקובץ שנבחר</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="manual-card-numbers">הוסף מספרי כרטיסים ידנית (מופרדים בפסיקים)</Label>
              <Input
                id="manual-card-numbers"
                placeholder="לדוגמה: 1234, 5678"
                value={cardNumbersInput}
                onChange={(e) => setCardNumbersInput(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                הוסף מספרי כרטיסים ידנית אם הם לא זוהו אוטומטית
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCardNumbers([]);
                setCardFilter([]);
                setShowCardFilterDialog(false);
              }}
            >
              בטל סינון
            </Button>
            <Button onClick={applyCardFilter}>
              החל סינון
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>תצוגה מקדימה של עסקאות</DialogTitle>
            <DialogDescription>
              סקור את העסקאות לפני הייבוא
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-1">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">סה"כ עסקאות: </span>
                    <span>{previewData.length}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="font-medium text-finance-income">הכנסות: </span>
                      <span>
                        {formatCurrency(
                          previewData
                            .filter((tx) => tx.type === "income")
                            .reduce((sum, tx) => sum + tx.amount, 0)
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-finance-expense">הוצאות: </span>
                      <span>
                        {formatCurrency(
                          previewData
                            .filter((tx) => tx.type === "expense")
                            .reduce((sum, tx) => sum + tx.amount, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          תאריך
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          תיאור
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          סוג
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          כרטיס
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          קטגוריה
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          סכום
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {previewData.map((tx, index) => {
                        const category = state.categories.find(
                          (cat) => cat.id === tx.categoryId
                        );
                        return (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-right">
                              {tx.date}
                            </td>
                            <td className="px-4 py-2 text-sm max-w-[200px] truncate text-right">
                              {tx.description}
                            </td>
                            <td className="px-4 py-2 text-sm text-right">
                              <span className="inline-flex items-center">
                                {tx.type === "income" ? (
                                  <ArrowUpCircle className="ml-1 h-3 w-3 text-finance-income" />
                                ) : (
                                  <ArrowDownCircle className="ml-1 h-3 w-3 text-finance-expense" />
                                )}
                                {tx.type === "income" ? "הכנסה" : "הוצאה"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-right">
                              {tx.cardNumber || "-"}
                            </td>
                            <td className="px-4 py-2 text-sm text-right">
                              {category?.name || "ללא קטגוריה"}
                            </td>
                            <td className={`px-4 py-2 text-sm text-left ${
                              tx.type === "income"
                                ? "text-finance-income"
                                : "text-finance-expense"
                            }`}>
                              {formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cancelImport}>
              ביטול
            </Button>
            <Button type="button" onClick={confirmImport}>
              ייבא {previewData.length} עסקאות
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewFormatDialog} onOpenChange={setShowNewFormatDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>יצירת פורמט ייבוא חדש</DialogTitle>
            <DialogDescription>
              הגדר כיצד עמודות הקובץ ממופות לנתוני העסקאות
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="format-name">שם הפורמט</Label>
              <Input
                id="format-name"
                name="name"
                placeholder="לדוגמה, פורמט הבנק שלי"
                value={newFormat.name}
                onChange={(e) => handleNewFormatChange(e)}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">מיפוי עמודות</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="map-date">עמודת תאריך <span className="text-red-500">*</span></Label>
                  <Input
                    id="map-date"
                    placeholder="לדוגמה, תאריך"
                    value={newFormat.mapping.date}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "date")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map-amount">עמודת סכום <span className="text-red-500">*</span></Label>
                  <Input
                    id="map-amount"
                    placeholder="לדוגמה, סכום"
                    value={newFormat.mapping.amount}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "amount")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map-description">עמודת תיאור <span className="text-red-500">*</span></Label>
                  <Input
                    id="map-description"
                    placeholder="לדוגמה, תיאור"
                    value={newFormat.mapping.description}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "description")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map-type">עמודת סוג (אופציונלי)</Label>
                  <Input
                    id="map-type"
                    placeholder="לדוגמה, סוג"
                    value={newFormat.mapping.type || ""}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "type")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map-category">עמודת קטגוריה (אופציונלי)</Label>
                  <Input
                    id="map-category"
                    placeholder="לדוגמה, קטגוריה"
                    value={newFormat.mapping.category || ""}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "category")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map-card-number">עמודת מספר כרטיס (אופציונלי)</Label>
                  <Input
                    id="map-card-number"
                    placeholder="לדוגמה, מספר כרטיס"
                    value={newFormat.mapping.cardNumber || ""}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "cardNumber")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">פורמט תאריך</Label>
                  <Select 
                    value={newFormat.dateFormat}
                    onValueChange={(value) => setNewFormat(prev => ({ ...prev, dateFormat: value }))}
                  >
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="בחר פורמט תאריך" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">הגדרת סוג עסקה</h4>
              <div className="space-y-2">
                <Label htmlFor="type-column">עמודת זיהוי סוג</Label>
                <Input
                  id="type-column"
                  placeholder="לדוגמה, סוג או קטגוריה"
                  value={newFormat.typeIdentifier?.column || ""}
                  onChange={(e) => handleNewFormatChange(e, "typeIdentifier", "column")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-values">
                  ערכי הכנסה (מופרדים בפסיקים)
                </Label>
                <Input
                  id="income-values"
                  placeholder="לדוגמה, הכנסה,זיכוי,משכורת"
                  value={newFormat.typeIdentifier?.incomeValues.join(", ") || ""}
                  onChange={(e) => handleArrayChange(e.target.value, "typeIdentifier", "incomeValues")}
                />
                <p className="text-xs text-gray-500 text-right">
                  מילים המציינות עסקת הכנסה
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-values">
                  ערכי הוצאה (מופרדים בפסיקים)
                </Label>
                <Input
                  id="expense-values"
                  placeholder="לדוגמה, הוצאה,חיוב,תשלום"
                  value={newFormat.typeIdentifier?.expenseValues.join(", ") || ""}
                  onChange={(e) => handleArrayChange(e.target.value, "typeIdentifier", "expenseValues")}
                />
                <p className="text-xs text-gray-500 text-right">
                  מילים המציינות עסקת הוצאה
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delimiter">מפריד CSV</Label>
                <Select
                  value={newFormat.delimiter || ","}
                  onValueChange={(value) => setNewFormat(prev => ({ ...prev, delimiter: value }))}
                >
                  <SelectTrigger id="delimiter">
                    <SelectValue placeholder="בחר מפריד CSV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">פסיק (,)</SelectItem>
                    <SelectItem value=";">נקודה-פסיק (;)</SelectItem>
                    <SelectItem value="\t">טאב</SelectItem>
                    <SelectItem value="|">צינור (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowNewFormatDialog(false)}>
              ביטול
            </Button>
            <Button type="button" onClick={addNewFormat}>
              שמור פורמט
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileImport;
