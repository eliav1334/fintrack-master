
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
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, CheckCircle, FileText, Upload } from "lucide-react";
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
import { format } from "date-fns";

const FileImport = () => {
  const { state, addTransactions, addImportFormat } = useFinance();
  const { toast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [previewData, setPreviewData] = useState<Omit<Transaction, "id">[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showNewFormatDialog, setShowNewFormatDialog] = useState<boolean>(false);
  const [newFormat, setNewFormat] = useState<Omit<FileImportFormat, "id">>({
    name: "",
    mapping: {
      date: "",
      amount: "",
      description: "",
      type: "",
      category: "",
    },
    dateFormat: "YYYY-MM-DD",
    delimiter: ",",
    typeIdentifier: {
      column: "",
      incomeValues: [],
      expenseValues: [],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setPreviewData([]);
      setShowPreview(false);
    }
  };

  const handleFormatChange = (value: string) => {
    setSelectedFormatId(value);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFormatId) {
      toast({
        title: "Error",
        description: "Please select an import format",
        variant: "destructive",
      });
      return;
    }

    const format = state.importFormats.find((f) => f.id === selectedFormatId);
    if (!format) {
      toast({
        title: "Error",
        description: "Selected format not found",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(10);

    try {
      // Parse the file
      setImportProgress(30);
      const result = await parseFile(selectedFile, format);
      setImportProgress(70);

      if (!result.success || !result.data) {
        toast({
          title: "Error",
          description: result.error || "Failed to parse file",
          variant: "destructive",
        });
        setIsImporting(false);
        setImportProgress(0);
        return;
      }

      // Show preview before final import
      setPreviewData(result.data);
      setShowPreview(true);
      setImportProgress(100);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const confirmImport = () => {
    if (previewData.length === 0) {
      toast({
        title: "Error",
        description: "No data to import",
        variant: "destructive",
      });
      return;
    }

    try {
      addTransactions(previewData);
      toast({
        title: "Success",
        description: `Imported ${previewData.length} transactions successfully`,
      });
      
      // Reset state
      setSelectedFile(null);
      setPreviewData([]);
      setShowPreview(false);
      setImportProgress(0);
      
      // Clear file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import transactions",
        variant: "destructive",
      });
    }
  };

  const cancelImport = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setImportProgress(0);
    
    // Clear file input
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
      setNewFormat((prev) => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [subField]: value,
        },
      }));
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
    setNewFormat((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: values,
      },
    }));
  };

  const addNewFormat = () => {
    // Validate form
    if (!newFormat.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a format name",
        variant: "destructive",
      });
      return;
    }
    
    if (!newFormat.mapping.date || !newFormat.mapping.amount || !newFormat.mapping.description) {
      toast({
        title: "Error",
        description: "Please fill in all required mapping fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      addImportFormat(newFormat);
      toast({
        title: "Success",
        description: "New import format added successfully",
      });
      
      // Reset form and close dialog
      setNewFormat({
        name: "",
        mapping: {
          date: "",
          amount: "",
          description: "",
          type: "",
          category: "",
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
        title: "Error",
        description: "Failed to add new format",
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
      <h1 className="text-3xl font-semibold mb-6">Import Transactions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="finance-card finance-card-hover">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Import transactions from a CSV or Excel file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
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
                    {selectedFile ? selectedFile.name : "Click to select a file"}
                  </Label>
                  <p className="text-xs text-gray-500">
                    Supported formats: CSV, Excel
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="format">Import Format</Label>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-xs"
                  onClick={() => setShowNewFormatDialog(true)}
                >
                  + Add New Format
                </Button>
              </div>
              <Select value={selectedFormatId} onValueChange={handleFormatChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a format" />
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

            <Button
              onClick={handleImport}
              disabled={!selectedFile || !selectedFormatId || isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Transactions
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
            <CardTitle>Import Instructions</CardTitle>
            <CardDescription>
              Learn how to prepare your file for import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">File Format Requirements</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Use CSV or Excel file formats</li>
                <li>Include headers in the first row</li>
                <li>Required columns: Date, Amount, Description</li>
                <li>Optional columns: Type, Category</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Column Formats</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>
                  <strong>Date:</strong> Use consistent date format (e.g., YYYY-MM-DD)
                </li>
                <li>
                  <strong>Amount:</strong> Numeric values (positive for income, negative for expenses)
                </li>
                <li>
                  <strong>Type:</strong> Text indicating transaction type (e.g., "income", "expense")
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Tips</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Create separate formats for different bank exports</li>
                <li>Preview data before confirming the import</li>
                <li>Check category mappings to ensure correct categorization</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Transactions</DialogTitle>
            <DialogDescription>
              Review the transactions before importing
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-1">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Total Transactions: </span>
                    <span>{previewData.length}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="font-medium text-finance-income">Income: </span>
                      <span>
                        {formatCurrency(
                          previewData
                            .filter((tx) => tx.type === "income")
                            .reduce((sum, tx) => sum + tx.amount, 0)
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-finance-expense">Expense: </span>
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
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
                            <td className="px-4 py-2 text-sm">
                              {tx.date}
                            </td>
                            <td className="px-4 py-2 text-sm max-w-[200px] truncate">
                              {tx.description}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className="inline-flex items-center">
                                {tx.type === "income" ? (
                                  <ArrowUpCircle className="mr-1 h-3 w-3 text-finance-income" />
                                ) : (
                                  <ArrowDownCircle className="mr-1 h-3 w-3 text-finance-expense" />
                                )}
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {category?.name || "Uncategorized"}
                            </td>
                            <td className={`px-4 py-2 text-sm text-right ${
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
              Cancel
            </Button>
            <Button type="button" onClick={confirmImport}>
              Import {previewData.length} Transactions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Format Dialog */}
      <Dialog open={showNewFormatDialog} onOpenChange={setShowNewFormatDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Import Format</DialogTitle>
            <DialogDescription>
              Define how your file columns map to transaction data
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="format-name">Format Name</Label>
              <Input
                id="format-name"
                name="name"
                placeholder="e.g., My Bank Format"
                value={newFormat.name}
                onChange={(e) => handleNewFormatChange(e)}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Column Mapping</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="map-date">Date Column <span className="text-red-500">*</span></Label>
                  <Input
                    id="map-date"
                    placeholder="e.g., Date"
                    value={newFormat.mapping.date}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "date")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map-amount">Amount Column <span className="text-red-500">*</span></Label>
                  <Input
                    id="map-amount"
                    placeholder="e.g., Amount"
                    value={newFormat.mapping.amount}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "amount")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map-description">Description Column <span className="text-red-500">*</span></Label>
                  <Input
                    id="map-description"
                    placeholder="e.g., Description"
                    value={newFormat.mapping.description}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "description")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map-type">Type Column (Optional)</Label>
                  <Input
                    id="map-type"
                    placeholder="e.g., Type"
                    value={newFormat.mapping.type || ""}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "type")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map-category">Category Column (Optional)</Label>
                  <Input
                    id="map-category"
                    placeholder="e.g., Category"
                    value={newFormat.mapping.category || ""}
                    onChange={(e) => handleNewFormatChange(e, "mapping", "category")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select 
                    value={newFormat.dateFormat}
                    onValueChange={(value) => setNewFormat(prev => ({ ...prev, dateFormat: value }))}
                  >
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select date format" />
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
              <h4 className="font-medium">Transaction Type Configuration</h4>
              <div className="space-y-2">
                <Label htmlFor="type-column">Type Identifier Column</Label>
                <Input
                  id="type-column"
                  placeholder="e.g., Type or Category"
                  value={newFormat.typeIdentifier?.column || ""}
                  onChange={(e) => handleNewFormatChange(e, "typeIdentifier", "column")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-values">
                  Income Values (Comma-separated)
                </Label>
                <Input
                  id="income-values"
                  placeholder="e.g., income,deposit,credit"
                  value={newFormat.typeIdentifier?.incomeValues.join(", ") || ""}
                  onChange={(e) => handleArrayChange(e.target.value, "typeIdentifier", "incomeValues")}
                />
                <p className="text-xs text-gray-500">
                  Words that indicate an income transaction
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-values">
                  Expense Values (Comma-separated)
                </Label>
                <Input
                  id="expense-values"
                  placeholder="e.g., expense,payment,debit"
                  value={newFormat.typeIdentifier?.expenseValues.join(", ") || ""}
                  onChange={(e) => handleArrayChange(e.target.value, "typeIdentifier", "expenseValues")}
                />
                <p className="text-xs text-gray-500">
                  Words that indicate an expense transaction
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delimiter">CSV Delimiter</Label>
                <Select
                  value={newFormat.delimiter || ","}
                  onValueChange={(value) => setNewFormat(prev => ({ ...prev, delimiter: value }))}
                >
                  <SelectTrigger id="delimiter">
                    <SelectValue placeholder="Select CSV delimiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">Comma (,)</SelectItem>
                    <SelectItem value=";">Semicolon (;)</SelectItem>
                    <SelectItem value="\t">Tab</SelectItem>
                    <SelectItem value="|">Pipe (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowNewFormatDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={addNewFormat}>
              Save Format
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileImport;
