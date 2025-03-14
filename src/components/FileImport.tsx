import React, { useState, useEffect } from "react";
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
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, FileText, Upload } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// כרטיסי אשראי מותרים לייבוא
const ALLOWED_CARD_NUMBERS = ["1515", "0691"];
// כרטיסי אשראי לא מותרים לייבוא
const BLOCKED_CARD_NUMBER = "2623";

// תהליך איתור תשלומים קבועים וזיהוי חריגות מחיר
const analyzeRecurringTransactions = (
  newTransactions: Omit<Transaction, "id">[],
  existingTransactions: Transaction[]
): string[] => {
  const alerts: string[] = [];
  
  // יצירת מפתח עבור תשלומים קבועים
  const recurringPayments = new Map<string, Transaction[]>();
  
  // מיון תשלומים קבועים קיימים
  existingTransactions.forEach(tx => {
    if (tx.type === "expense") {
      const key = tx.description.trim().toLowerCase();
      if (!recurringPayments.has(key)) {
        recurringPayments.set(key, []);
      }
      recurringPayments.get(key)?.push(tx);
    }
  });
  
  // עבור כל עסקה חדשה, בדוק אם היא תשלום קבוע
  newTransactions.forEach(newTx => {
    if (newTx.type === "expense") {
      const key = newTx.description.trim().toLowerCase();
      const existingPayments = recurringPayments.get(key);
      
      // אם יש לפחות 2 עסקאות באותו הסכום בעבר - כנראה תשלום קבוע
      if (existingPayments && existingPayments.length >= 2) {
        // בדיקה אם הסכומים שווים פחות או יותר
        const commonAmount = existingPayments[0].amount;
        const sameAmountCount = existingPayments.filter(tx => 
          Math.abs(tx.amount - commonAmount) < 0.01
        ).length;
        
        // אם רוב התשלומים באותו סכום - כנראה תשלום קבוע
        if (sameAmountCount > existingPayments.length / 2) {
          // בדיקה אם הסכום החדש גבוה מהסכום הקבוע
          if (newTx.amount > commonAmount * 1.1) { // עליה של 10% ומעלה
            alerts.push(
              `עליית מחיר בתשלום קבוע: ${newTx.description} - ${newTx.amount.toFixed(2)}₪ במקום ${commonAmount.toFixed(2)}₪ (עליה של ${((newTx.amount - commonAmount) / commonAmount * 100).toFixed(1)}%)`
            );
          }
        }
      }
    }
  });
  
  return alerts;
};

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
  const [cardFilter, setCardFilter] = useState<string[]>(ALLOWED_CARD_NUMBERS);
  const [cardNumbersInput, setCardNumbersInput] = useState<string>("");
  const [extractedCardNumbers, setExtractedCardNumbers] = useState<string[]>([]);
  const [selectedCardNumbers, setSelectedCardNumbers] = useState<string[]>(ALLOWED_CARD_NUMBERS);
  const [showCardFilterDialog, setShowCardFilterDialog] = useState<boolean>(false);
  const [priceAlerts, setPriceAlerts] = useState<string[]>([]);
  
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

  // עדכון טעינת כרטיסי אשראי כברירת מחדל
  useEffect(() => {
    setCardFilter(ALLOWED_CARD_NUMBERS);
    setSelectedCardNumbers(ALLOWED_CARD_NUMBERS);
  }, []);

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
      setPriceAlerts([]);
      
      // איפוס כרטיסי אשראי לברירת מחדל המותרים
      setCardNumbersInput("");
      setExtractedCardNumbers([]);
      setSelectedCardNumbers(ALLOWED_CARD_NUMBERS);
      setCardFilter(ALLOWED_CARD_NUMBERS);
      
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
          // מסנן כרטיסים לפי ההגבלות
          const allowedCards = cardNumbers.filter(card => 
            ALLOWED_CARD_NUMBERS.some(allowed => card.includes(allowed)) && 
            !card.includes(BLOCKED_CARD_NUMBER)
          );
          setSelectedCardNumbers(allowedCards);
          setCardFilter(allowedCards);
          
          // אם יש כרטיסים מותרים, הצג חלון סינון
          if (allowedCards.length > 0) {
            setShowCardFilterDialog(true);
          } else {
            toast({
              title: "אזהרה",
              description: "לא נמצאו כרטיסי אשראי מותרים בקובץ",
              variant: "destructive"
            });
          }
        }
      }
      
      setImportProgress(0);
    } catch (error) {
      console.error("Error extracting card numbers:", error);
      setImportProgress(0);
    }
  };

  const handleCardFilterChange = (cardNumber: string, checked: boolean) => {
    // אם זהו הכרטיס החסום, לא נאפשר סימון
    if (cardNumber.includes(BLOCKED_CARD_NUMBER)) {
      toast({
        title: "לא ניתן לייבא",
        description: `כרטיס אשראי ${BLOCKED_CARD_NUMBER} אינו מורשה לייבוא`,
        variant: "destructive"
      });
      return;
    }
    
    // בדיקה אם הכרטיס מותר
    const isAllowed = ALLOWED_CARD_NUMBERS.some(allowed => cardNumber.includes(allowed));
    
    if (!isAllowed) {
      toast({
        title: "לא ניתן לייבא",
        description: `רק כרטיסי אשראי ${ALLOWED_CARD_NUMBERS.join(', ')} מורשים לייבוא`,
        variant: "destructive"
      });
      return;
    }
    
    if (checked) {
      setSelectedCardNumbers(prev => [...prev, cardNumber]);
    } else {
      setSelectedCardNumbers(prev => prev.filter(num => num !== cardNumber));
    }
  };

  const applyCardFilter = () => {
    // ודא שרק כרטיסים מורשים נכללים
    const filteredCards = selectedCardNumbers.filter(card => 
      ALLOWED_CARD_NUMBERS.some(allowed => card.includes(allowed)) && 
      !card.includes(BLOCKED_CARD_NUMBER)
    );
    
    setCardFilter(filteredCards);
    setShowCardFilterDialog(false);
    
    if (filteredCards.length > 0) {
      toast({
        title: "סינון הוגדר",
        description: `יבוצע סינון לפי ${filteredCards.length} מספרי כרטיסים מורשים`,
      });
    } else {
      toast({
        title: "אזהרה",
        description: "לא נבחרו כרטיסים מורשים, ייבוא לא יכלול עסקאות",
        variant: "destructive"
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

    // ודא שכרטיס 2623 לא נכלל בסינון
    const safeCardFilter = cardFilter.filter(card => !card.includes(BLOCKED_CARD_NUMBER));
    if (safeCardFilter.length < cardFilter.length) {
      toast({
        title: "אזהרה",
        description: `כרטיס ${BLOCKED_CARD_NUMBER} הוסר מהסינון כי אינו מורשה לייבוא`,
      });
      setCardFilter(safeCardFilter);
    }

    setIsImporting(true);
    setImportProgress(10);
    setErrorMessage(null);
    setPriceAlerts([]);

    try {
      setImportProgress(30);
      console.log("Parsing file:", selectedFile.name, "with format:", format.name, "card filter:", safeCardFilter);
      const result = await parseFile(selectedFile, format, safeCardFilter.length > 0 ? safeCardFilter : undefined);
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
      
      // בדיקת תשלומים קבועים וזיהוי חריגות מחיר
      const alerts = analyzeRecurringTransactions(dataWithCreatedAt, state.transactions);
      setPriceAlerts(alerts);
      
      if (alerts.length > 0) {
        console.log("Price increase alerts:", alerts);
      }
      
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
      
      let successMessage = `יובאו ${previewData.length} עסקאות בהצלחה`;
      if (priceAlerts.length > 0) {
        successMessage += ` (כולל ${priceAlerts.length} תשלומים קבועים עם שינויי מחיר)`;
      }
      
      toast({
        title: "הצלחה",
        description: successMessage,
      });
      
      // התראות על חריגות מחיר
      priceAlerts.forEach(alert => {
        toast({
          title: "התראת עליית מחיר",
          description: alert,
          variant: "destructive",
          duration: 8000 // זמן ארוך יותר להתראות חשובות
        });
      });
      
      setSelectedFile(null);
      setPreviewData([]);
      setPriceAlerts([]);
      setShowPreview(false);
      setImportProgress(0);
      
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
        description: "אנא הזן שם לפורמט",
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
                ייבוא עסקאות מקובץ CSV או Excel (מורשה רק לכרטיסים 1515 ו-0691)
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
                    <p className="text-xs text-amber-500 font-medium">
                      הערה: מורשה לייבא רק כרטיסים 1515 ו-0691
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
                    <span className="font-medium text-sm">סינון לפי כרטיסי אשראי מורשים:</span>
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
                <h3 className="font-medium">הגבלות ייבוא</h3>
                <ul className="list-disc pr-5 text-sm space-y-1 text-right">
                  <li>
                    <strong className="text-green-600">מורשה לייבא:</strong> כרטיסי אשראי המכילים את המספרים 1515 או 0691
                  </li>
                  <li>
                    <strong className="text-red-600">לא מורשה לייבא:</strong> כרטיסי אשראי המכילים את המספר 2623
                  </li>
                  <li>המערכת מזהה תשלומים קבועים ומתריעה על עליות מחיר חריגות</li>
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
                <h3 className="font-medium">זיהוי תשלומים קבועים</h3>
                <ul className="list-disc pr-5 text-sm space-y-1 text-right">
                  <li>המערכת מזהה תשלומים קבועים לפי תיאור העסקה וחזרתיות</li>
                  <li>כאשר מזוהה עלייה של 10% ומעלה במחיר של תשלום קבוע, תוצג התראה</li>
                  <li>תשלומים קבועים חריגים מסומנים להתייחסות מיוחדת</li>
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
            <DialogTitle>סינון לפי כרטיסי אשראי מורשים</DialogTitle>
            <DialogDescription>
              מורשה לייבא רק כרטיסים המכילים 1515 או 0691
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {extractedCardNumbers.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm">מספרי כרטיסי אשראי שזוהו בקובץ:</p>
                <div className="space-y-2 border rounded-md p-3">
                  {extractedCardNumbers.map((cardNumber) => {
                    // בדיקה אם הכרטיס מכיל את המספר החסום
                    const isBlocked = cardNumber.includes(BLOCKED_CARD_NUMBER);
                    // בדיקה אם הכרטיס מכיל אחד מהמספרים המותרים
                    const isAllowed = ALLOWED_CARD_NUMBERS.some(allowed => 
                      cardNumber.includes(allowed)
                    );
                    
                    return (
                      <div key={cardNumber} className="flex items-center space-x-2 pl-2 ml-2">
                        <Checkbox 
                          id={`card-${cardNumber}`}
                          checked={selectedCardNumbers.includes(cardNumber) && isAllowed && !isBlocked}
                          disabled={isBlocked || !isAllowed}
                          onCheckedChange={(checked) => handleCardFilterChange(cardNumber, checked === true)}
                        />
                        <Label 
                          htmlFor={`card-${cardNumber}`} 
                          className={`text-sm cursor-pointer ${isBlocked ? 'text-red-500 line-through' : ''} ${!isAllowed && !isBlocked ? 'text-gray-400' : ''}`}>
                          {cardNumber}
                          {isBlocked && <span className="mr-2 text-red-500 text-xs">(חסום)</span>}
                          {!isAllowed && !isBlocked && <span className="mr-2 text-gray-500 text-xs">(לא מורשה)</span>}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between pt-2">
                  <p className="text-xs text-amber-500">
                    שים לב: רק כרטיסים 1515 ו-0691 מורשים לייבוא
                  </p>
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
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCardNumbers(ALLOWED_CARD_NUMBERS);
                setCardFilter(ALLOWED_CARD_NUMBERS);
                setShowCardFilterDialog(false);
              }}
            >
              איפוס לברירת מחדל
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
                  <div className="flex items-center space-x-4 gap-2">
                    <div>
                      <span
