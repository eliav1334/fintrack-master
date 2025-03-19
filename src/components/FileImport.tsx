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
import { parseFile } from "@/utils/parser";
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

/**
 * פונקציה לזיהוי עסקאות כפולות
 * @param newTransactions העסקאות החדשות מהייבוא
 * @param existingTransactions העסקאות הקיימות במערכת
 * @returns מערך של עסקאות כפולות ומערך של עסקאות חדשות בלבד
 */
const detectDuplicateTransactions = (
  newTransactions: Omit<Transaction, "id">[],
  existingTransactions: Transaction[]
): {
  duplicates: Omit<Transaction, "id">[];
  nonDuplicates: Omit<Transaction, "id">[];
} => {
  const duplicates: Omit<Transaction, "id">[] = [];
  const nonDuplicates: Omit<Transaction, "id">[] = [];
  
  // בדיקת כל עסקה חדשה מול העסקאות הקיימות
  newTransactions.forEach(newTx => {
    // בודקים אם קיימת עסקה עם אותו תאריך, סכום ותיאור
    const isDuplicate = existingTransactions.some(existingTx => 
      existingTx.date === newTx.date && 
      Math.abs(existingTx.amount - newTx.amount) < 0.01 && // השוואת סכומים עם טווח סבירות קטן
      existingTx.description === newTx.description &&
      existingTx.type === newTx.type
    );
    
    if (isDuplicate) {
      duplicates.push(newTx);
    } else {
      nonDuplicates.push(newTx);
    }
  });
  
  return { duplicates, nonDuplicates };
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

  const [sheetInfo, setSheetInfo] = useState<{ [sheetName: string]: number }>({});

  // עדכון טעינת כרטיסי אשראי כברירת מחדל
  useEffect(() => {
    setCardFilter(ALLOWED_CARD_NUMBERS);
    setSelectedCardNumbers(ALLOWED_CARD_NUMBERS);
  }, []);

  useEffect(() => {
    console.log("Available import formats:", state.importFormats);
  }, [state.importFormats]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      if (!['csv', 'xlsx', 'xls'].includes(fileExt || '')) {
        setErrorMessage("סוג קובץ לא נתמך. אנא ��שתמש בקובץ CSV או אקסל (xlsx/xls)");
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

  const [duplicateTransactions, setDuplicateTransactions] = useState<Omit<Transaction, "id">[]>([]);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState<boolean>(false);
  const [includeDuplicates, setIncludeDuplicates] = useState<boolean>(false);

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
    setDuplicateTransactions([]);

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

      // שמירת מידע על הגליונות
      if (result.sheetInfo) {
        setSheetInfo(result.sheetInfo);
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
      
      // זיהוי עסקאות כפולות
      const { duplicates, nonDuplicates } = detectDuplicateTransactions(
        dataWithCreatedAt,
        state.transactions
      );
      
      if (duplicates.length > 0) {
        console.log(`נמצאו ${duplicates.length} עסקאות כפולות`, duplicates);
        setDuplicateTransactions(duplicates);
        
        // שמירת העסקאות הלא כפולות לתצוגה
        setPreviewData(nonDuplicates);
        
        // אם יש עסקאות כפולות, הצג חלון התראה
        if (duplicates.length > 0) {
          setShowDuplicatesDialog(true);
          setImportProgress(100);
          setIsImporting(false);
          return;
        }
      } else {
        // אם אין עסקאות כפולות, שמירת כל העסקאות לתצוגה
        setPreviewData(dataWithCreatedAt);
      }
      
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
    if (previewData.length === 0 && !includeDuplicates) {
      toast({
        title: "שגיאה",
        description: "אין נתונים חדשים לייבוא",
        variant: "destructive",
      });
      return;
    }

    try {
      // הוספת העסקאות החדשות (לא כפולות)
      if (previewData.length > 0) {
        addTransactions(previewData);
      }
      
      // אם המשתמש בחר לכלול גם כפולות, הוסף אותן
      if (includeDuplicates && duplicateTransactions.length > 0) {
        addTransactions(duplicateTransactions);
      }
      
      // יצירת הודעת הצלחה עם פירוט
      let successMessage = `יובאו ${previewData.length} עסקאות בהצלחה`;
      
      if (includeDuplicates && duplicateTransactions.length > 0) {
        successMessage += ` (כולל ${duplicateTransactions.length} עסקאות כפולות)`;
      }
      
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
      
      setDuplicateTransactions([]);
      setIncludeDuplicates(false);
      
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

  const handleContinueWithDuplicates = () => {
    setIncludeDuplicates(true);
    setShowDuplicatesDialog(false);
    setShowPreview(true);
    
    // אם בחרו לכלול כפולות, מוסיפים את שתי הקבוצות לתצוגה המקדימה
    if (includeDuplicates) {
      setPreviewData([...previewData, ...duplicateTransactions]);
    }
  };

  const handleContinueWithoutDuplicates = () => {
    setIncludeDuplicates(false);
    setShowDuplicatesDialog(false);
    setShowPreview(true);
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
                <Select 
                  value={selectedFormatId} 
                  onValueChange={handleFormatChange}
                  defaultOpen={false}
                >
                  <SelectTrigger id="format-selector" className="w-full">
                    <SelectValue placeholder="בחר פורמט" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.importFormats && state.importFormats.length > 0 ? (
                      state.importFormats.map((format) => (
                        <SelectItem key={format.id} value={format.id}>
                          {format.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-formats" disabled>
                        אין פורמטים זמינים
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {state.importFormats.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    לא נמצאו פורמטים. אנא הוסף פורמט חדש כדי להמשיך.
                  </p>
                )}
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

      {/* חלון כפילויות */}
      <Dialog open={showDuplicatesDialog} onOpenChange={setShowDuplicatesDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>נמצאו עסקאות כפולות</DialogTitle>
            <DialogDescription>
              זיהינו {duplicateTransactions.length} עסקאות שכבר קיימות במערכת. האם ברצונך לייבא אותן בכל זאת?
            </DialogDescription>
          </DialogHeader>
          
          {duplicateTransactions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">עסקאות כפולות:</h4>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {duplicateTransactions.map((tx, index) => (
                    <div key={index} className="text-sm p-2 border-b">
                      <div className="font-medium">{tx.description}</div>
                      <div className="flex justify-between mt-1">
                        <span>{format(new Date(tx.date), "dd/MM/yyyy")}</span>
                        <span className={`font-medium ${tx.type === 'income' ? 'text-finance-income' : 'text-finance-expense'}`}>
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          <DialogFooter className="mt-6 flex justify-between">
            <Button variant="outline" onClick={handleContinueWithoutDuplicates}>
              המשך ללא כפילויות
            </Button>
            <Button onClick={handleContinueWithDuplicates}>
              ייבא הכל (כולל כפילויות)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* חלון סינון כרטיסי אשראי */}
      <Dialog open={showCardFilterDialog} onOpenChange={setShowCardFilterDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>סינון לפי כרטיסי אשראי</DialogTitle>
            <DialogDescription>
              בחר את כרטיסי האשראי שברצונך לייבא
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 rounded-md text-sm">
              <p className="text-amber-800 dark:text-amber-300 font-medium">רק כרטיסי אשראי המכילים {ALLOWED_CARD_NUMBERS.join(', ')} מורשים לייבוא.</p>
              <p className="text-red-700 dark:text-red-400 text-xs mt-1">כרטיסי אשראי המכילים {BLOCKED_CARD_NUMBER} אינם מורשים לייבוא.</p>
            </div>
            
            {extractedCardNumbers.length > 0 ? (
              <div className="space-y-2">
                {extractedCardNumbers.map((cardNumber) => {
                  const isAllowed = ALLOWED_CARD_NUMBERS.some(allowed => cardNumber.includes(allowed));
                  const isBlocked = cardNumber.includes(BLOCKED_CARD_NUMBER);
                  
                  return (
                    <div key={cardNumber} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`card-${cardNumber}`}
                        checked={selectedCardNumbers.includes(cardNumber)}
                        onCheckedChange={(checked) => handleCardFilterChange(cardNumber, checked === true)}
                        disabled={!isAllowed || isBlocked}
                      />
                      <Label
                        htmlFor={`card-${cardNumber}`}
                        className={`
                          ${!isAllowed ? 'text-gray-400' : ''}
                          ${isBlocked ? 'text-red-500 line-through' : ''}
                        `}
                      >
                        {cardNumber}
                        {isBlocked && <span className="text-xs text-red-500 mr-2">(חסום)</span>}
                        {!isBlocked && !isAllowed && <span className="text-xs text-gray-500 mr-2">(לא מורשה)</span>}
                      </Label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-2">
                לא נמצאו מספרי כרטיסי אשראי בקובץ או שטרם נבחר פורמט ייבוא תקין
              </div>
            )}
            
            <div className="mt-2">
              <Label htmlFor="custom-card-numbers">הוסף כרטיסים ידנית (מופרדים בפסיקים)</Label>
              <Textarea
                id="custom-card-numbers"
                value={cardNumbersInput}
                onChange={(e) => setCardNumbersInput(e.target.value)}
                placeholder="הזן מספרי כרטיסים מופרדים בפסיקים..."
                className="mt-1 h-16"
              />
              {cardNumbersInput && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const customCards = cardNumbersInput
                      .split(',')
                      .map(card => card.trim())
                      .filter(Boolean);
                    
                    // רק כרטיסים מורשים
                    const allowedCustomCards = customCards.filter(card => 
                      ALLOWED_CARD_NUMBERS.some(allowed => card.includes(allowed)) &&
                      !card.includes(BLOCKED_CARD_NUMBER)
                    );
                    
                    if (allowedCustomCards.length > 0) {
                      setExtractedCardNumbers(prev => 
                        [...new Set([...prev, ...allowedCustomCards])]
                      );
                      setSelectedCardNumbers(prev => 
                        [...new Set([...prev, ...allowedCustomCards])]
                      );
                      setCardNumbersInput('');
                    } else {
                      toast({
                        title: "שגיאה",
                        description: "לא הוזנו כרטיסים מורשים תקינים",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  הוסף כרטיסים
                </Button>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCardFilterDialog(false)}
            >
              ביטול
            </Button>
            <Button onClick={applyCardFilter}>
              שמירה והחלת סינון
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* חלון הוספת פורמט ייבוא חדש */}
      <Dialog open={showNewFormatDialog} onOpenChange={setShowNewFormatDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>הוספת פורמט ייבוא חדש</DialogTitle>
            <DialogDescription>
              הגדר כיצד לפרש את הקובץ שלך
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="format-name">שם הפורמט</Label>
              <Input
                id="format-name"
                name="name"
                value={newFormat.name}
                onChange={(e) => handleNewFormatChange(e)}
                placeholder="לדוגמה: אקסל בנק הפועלים"
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">מיפוי עמודות</h4>
              <p className="text-xs text-gray-500">
                הזן את שמות העמודות בקובץ המקור שמכילות את המידע הרלוונטי
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mapping-date">עמודת תאריך <span className="text-red-500">*</span></Label>
                  <Input
                    id="mapping-date"
                    value={newFormat.mapping.date}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "date")}
                    placeholder="לדוגמה: Date או תאריך"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mapping-amount">עמודת סכום <span className="text-red-500">*</span></Label>
                  <Input
                    id="mapping-amount"
                    value={newFormat.mapping.amount}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "amount")}
                    placeholder="לדוגמה: Amount או סכום"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mapping-description">עמודת תיאור <span className="text-red-500">*</span></Label>
                  <Input
                    id="mapping-description"
                    value={newFormat.mapping.description}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "description")}
                    placeholder="לדוגמה: Description או תיאור"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mapping-type">עמודת סוג (אופציונלי)</Label>
                  <Input
                    id="mapping-type"
                    value={newFormat.mapping.type || ""}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "type")}
                    placeholder="לדוגמה: Type או סוג"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mapping-category">עמודת קטגוריה (אופציונלי)</Label>
                  <Input
                    id="mapping-category"
                    value={newFormat.mapping.category || ""}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "category")}
                    placeholder="לדוגמה: Category או קטגוריה"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mapping-card">עמודת מספר כרטיס (אופציונלי)</Label>
                  <Input
                    id="mapping-card"
                    value={newFormat.mapping.cardNumber || ""}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "cardNumber")}
                    placeholder="לדוגמה: CardNumber או מספר_כרטיס"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format-date">פורמט תאריך</Label>
              <Select
                value={newFormat.dateFormat}
                onValueChange={(value) => handleNewFormatChange({ target: { name: "dateFormat", value } } as any)}
              >
                <SelectTrigger id="format-date">
                  <SelectValue placeholder="בחר פורמט תאריך" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</SelectItem>
                  <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (31-12-2023)</SelectItem>
                  <SelectItem value="MM-DD-YYYY">MM-DD-YYYY (12-31-2023)</SelectItem>
                  <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (31.12.2023)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newFormat.delimiter !== undefined && (
              <div className="space-y-2">
                <Label htmlFor="format-delimiter">תו הפרדה (עבור CSV)</Label>
                <Select
                  value={newFormat.delimiter}
                  onValueChange={(value) => handleNewFormatChange({ target: { name: "delimiter", value } } as any)}
                >
                  <SelectTrigger id="format-delimiter">
                    <SelectValue placeholder="בחר תו הפרדה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">פסיק (,)</SelectItem>
                    <SelectItem value=";">נקודה-פסיק (;)</SelectItem>
                    <SelectItem value="\t">טאב (\t)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-medium">הגדרת זיהוי סוג העסקה</h4>
              
              <div className="space-y-2">
                <Label htmlFor="type-column">עמודה לזיהוי סוג העסקה</Label>
                <Input
                  id="type-column"
                  value={newFormat.typeIdentifier.column}
                  onChange={(e) => handleNewFormatChange(e, "typeIdentifier", "column")}
                  placeholder="שם העמודה שמכילה מידע על סוג העסקה"
                />
                <p className="text-xs text-gray-500">
                  העמודה שמכילה מידע שעל פיו ניתן להבדיל בין הכנסות והוצאות
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="income-values">ערכים שמזהים הכנסה</Label>
                <Textarea
                  id="income-values"
                  value={newFormat.typeIdentifier.incomeValues.join(", ")}
                  onChange={(e) => handleArrayChange(e.target.value, "typeIdentifier", "incomeValues")}
                  placeholder="זכות, income, הכנסה (הפרד בפסיקים)"
                  className="h-16"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expense-values">ערכים שמזהים הוצאה</Label>
                <Textarea
                  id="expense-values"
                  value={newFormat.typeIdentifier.expenseValues.join(", ")}
                  onChange={(e) => handleArrayChange(e.target.value, "typeIdentifier", "expenseValues")}
                  placeholder="חובה, expense, הוצאה (הפרד בפסיקים)"
                  className="h-16"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFormatDialog(false)}>
              ביטול
            </Button>
            <Button onClick={addNewFormat}>
              הוסף פורמט
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* תצוגה מקדימה של העסקאות לייבוא */}
      {showPreview && (
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>תצוגה מקדימה של העסקאות לייבוא</CardTitle>
              <CardDescription>
                נמצאו {previewData.length} עסקאות חדשות
                {Object.keys(sheetInfo).length > 0 && (
                  <span> מ-{Object.keys(sheetInfo).length} גליונות</span>
                )}
              </CardDescription>
            </div>
            <div className="flex space-s-2">
              <Button
                variant="outline"
                onClick={cancelImport}
              >
                ביטול
              </Button>
              <Button onClick={confirmImport}>
                אישור ייבוא
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* סיכום גליונות אם יש */}
            {Object.keys(sheetInfo).length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-md">
                <h4 className="text-sm font-medium mb-2">סיכום עסקאות לפי גליונות:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Object.entries(sheetInfo).map(([sheetName, count]) => (
                    <div key={sheetName} className="text-sm bg-background p-2 rounded-sm">
                      <span className="font-medium">{sheetName}:</span> {count} עסקאות
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* התראות מחיר אם יש */}
            {priceAlerts.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                  <AlertCircle className="inline-block w-5 h-5 mr-1" /> התראות עליית מחיר ({priceAlerts.length})
                </h4>
                <ul className="list-disc pr-4 space-y-1">
                  {priceAlerts.map((alert, index) => (
                    <li key={index} className="text-sm text-amber-800 dark:text-amber-300">
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-2 text-right">תאריך</th>
                    <th className="p-2 text-right">תיאור</th>
                    <th className="p-2 text-right">סכום</th>
                    <th className="p-2 text-right">סוג</th>
                    <th className="p-2 text-right">קטגוריה</th>
                    <th className="p-2 text-right">גיליון</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 100).map((tx, index) => (
                    <tr
                      key={index}
                      className={`
                        border-b
                        ${index % 2 === 0 ? "bg-card" : "bg-muted/30"}
                        ${tx.type === "income" ? "bg-green-50/50 dark:bg-green-950/30" : ""}
                        ${tx.type === "expense" ? "bg-red-50/30 dark:bg-red-950/20" : ""}
                      `}
                    >
                      <td className="p-2">
                        {format(new Date(tx.date), "dd/MM/yyyy")}
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{tx.description}</span>
                          {tx.cardNumber && (
                            <span className="text-xs text-gray-500">
                              כרטיס: {tx.cardNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <span
                          className={`font-medium ${
                            tx.type === "income"
                              ? "text-finance-income"
                              : "text-finance-expense"
                          }`}
                        >
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex">
                          {tx.type === "income" ? (
                            <ArrowUpCircle className="h-4 w-4 text-finance-income ml-1.5" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-finance-expense ml-1.5" />
                          )}
                          <span>
                            {tx.type === "income" ? "הכנסה" : "הוצאה"}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">{tx.categoryId || "—"}</td>
                      <td className="p-2">
                        {tx.sheetName ? (
                          <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                            {tx.sheetName}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 100 && (
                <div className="p-2 text-center text-sm text-muted-foreground bg-muted/30">
                  מוצגות 100 עסקאות מתוך {previewData.length}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileImport;
