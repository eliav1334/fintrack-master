
import React, { useState } from "react";
import { Transaction } from "@/types";
import { TransactionTypeRadio } from "./TransactionTypeRadio";
import { TransactionFormField } from "./TransactionFormField";
import { CategorySelect } from "./CategorySelect";
import { TransactionFormActions } from "./TransactionFormActions";
import { useTransactionForm } from "./useTransactionForm";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionFormProps {
  transaction?: Transaction;
  onClose?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onClose,
}) => {
  const {
    formData,
    isEditing,
    filteredCategories,
    handleInputChange,
    handleSelectChange,
    handleSwitchChange,
    handleElectricityChange,
    calculateElectricityAmount,
    handleSubmit,
  } = useTransactionForm(transaction, onClose);

  // חישוב הפרשי קריאה לכל מונה
  const mainMeterDiff = 
    formData.mainMeterReading?.current && formData.mainMeterReading?.previous
      ? formData.mainMeterReading.current - formData.mainMeterReading.previous
      : 0;
      
  const secondaryMeterDiff = 
    formData.secondaryMeterReading?.current && formData.secondaryMeterReading?.previous
      ? formData.secondaryMeterReading.current - formData.secondaryMeterReading.previous
      : 0;
  
  // סה"כ צריכה בקוט"ש
  const totalConsumption = mainMeterDiff + secondaryMeterDiff;
  
  // סה"כ חיוב לפני מע"מ
  const totalBeforeVat = totalConsumption * (formData.electricityRate || 0);
  
  // סה"כ חיוב כולל מע"מ
  const totalWithVat = totalBeforeVat * (1 + (formData.vatRate || 0) / 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <TransactionTypeRadio
          value={formData.type}
          onChange={(value) => handleSelectChange("type", value)}
        />

        <TransactionFormField
          id="description"
          label="תיאור"
          placeholder="לדוגמה, קניות במרכול"
          value={formData.description}
          onChange={handleInputChange}
        />

        {/* תוספת - בורר עבור תחשיב חשמל */}
        <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
          <Switch
            id="isElectricityBill"
            checked={formData.isElectricityBill}
            onCheckedChange={(checked) => handleSwitchChange("isElectricityBill", checked)}
          />
          <Label htmlFor="isElectricityBill" className="mr-2">חשבון חשמל עם שני מונים</Label>
        </div>

        {formData.isElectricityBill ? (
          <div className="rounded-md border border-gray-200 p-4 space-y-4">
            <h3 className="text-lg font-medium">תחשיב חשמל</h3>
            
            {/* מונה ראשי */}
            <div className="space-y-3">
              <h4 className="font-medium">מונה ראשי</h4>
              <div className="grid grid-cols-2 gap-2">
                <TransactionFormField
                  id="mainMeterCurrentReading"
                  label="מספר מונה נוכחי"
                  type="number"
                  value={formData.mainMeterReading?.current?.toString() || ""}
                  onChange={(e) => handleElectricityChange("mainMeterReading", "current", e.target.value)}
                />
                <TransactionFormField
                  id="mainMeterPreviousReading"
                  label="מספר מונה קודם"
                  type="number"
                  value={formData.mainMeterReading?.previous?.toString() || ""}
                  onChange={(e) => handleElectricityChange("mainMeterReading", "previous", e.target.value)}
                />
              </div>
              <TransactionFormField
                id="mainMeterDate"
                label="תאריך קריאה"
                type="date"
                value={formData.mainMeterReading?.date || ""}
                onChange={(e) => handleElectricityChange("mainMeterReading", "date", e.target.value)}
              />
              <div className="text-sm text-muted-foreground">
                הפרש: {mainMeterDiff} קוט&quot;ש
              </div>
            </div>
            
            {/* מונה משני */}
            <div className="space-y-3">
              <h4 className="font-medium">מונה משני</h4>
              <div className="grid grid-cols-2 gap-2">
                <TransactionFormField
                  id="secondaryMeterCurrentReading"
                  label="מספר מונה נוכחי"
                  type="number"
                  value={formData.secondaryMeterReading?.current?.toString() || ""}
                  onChange={(e) => handleElectricityChange("secondaryMeterReading", "current", e.target.value)}
                />
                <TransactionFormField
                  id="secondaryMeterPreviousReading"
                  label="מספר מונה קודם"
                  type="number"
                  value={formData.secondaryMeterReading?.previous?.toString() || ""}
                  onChange={(e) => handleElectricityChange("secondaryMeterReading", "previous", e.target.value)}
                />
              </div>
              <TransactionFormField
                id="secondaryMeterDate"
                label="תאריך קריאה"
                type="date"
                value={formData.secondaryMeterReading?.date || ""}
                onChange={(e) => handleElectricityChange("secondaryMeterReading", "date", e.target.value)}
              />
              <div className="text-sm text-muted-foreground">
                הפרש: {secondaryMeterDiff} קוט&quot;ש
              </div>
            </div>
            
            {/* תעריף ומע"מ */}
            <div className="grid grid-cols-2 gap-2">
              <TransactionFormField
                id="electricityRate"
                label="תעריף לקוט&quot;ש (₪)"
                type="number"
                step="0.01"
                value={formData.electricityRate?.toString() || ""}
                onChange={(e) => handleElectricityChange("electricityRate", "", e.target.value)}
              />
              <TransactionFormField
                id="vatRate"
                label="מע&quot;מ (%)"
                type="number"
                step="0.1"
                value={formData.vatRate?.toString() || "17"}
                onChange={(e) => handleElectricityChange("vatRate", "", e.target.value)}
              />
            </div>
            
            {/* סיכום חישוב */}
            <div className="rounded-md bg-muted p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>סה"כ צריכה:</div>
                <div className="text-left">{totalConsumption} קוט&quot;ש</div>
                <div>סכום לפני מע"מ:</div>
                <div className="text-left">{totalBeforeVat.toFixed(2)} ₪</div>
                <div>סה"כ כולל מע"מ:</div>
                <div className="text-left font-bold">{totalWithVat.toFixed(2)} ₪</div>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={calculateElectricityAmount}
            >
              <Calculator className="mr-2 h-4 w-4" />
              חשב וקבע סכום
            </Button>
          </div>
        ) : (
          <TransactionFormField
            id="amount"
            label="סכום"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleInputChange}
          />
        )}

        <TransactionFormField
          id="date"
          label="תאריך"
          type="date"
          value={formData.date}
          onChange={handleInputChange}
        />

        <CategorySelect
          categories={filteredCategories}
          selectedCategoryId={formData.categoryId}
          onChange={(value) => handleSelectChange("categoryId", value)}
        />

        <div className="space-y-2">
          <Label htmlFor="notes">הערות (אופציונלי)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="פרטים נוספים..."
            value={formData.notes || ""}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <TransactionFormActions isEditing={isEditing} onCancel={onClose} />
    </form>
  );
};
