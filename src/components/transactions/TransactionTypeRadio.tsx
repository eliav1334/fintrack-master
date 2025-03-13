
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TransactionType } from "@/types";

interface TransactionTypeRadioProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}

export const TransactionTypeRadio: React.FC<TransactionTypeRadioProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">סוג עסקה</Label>
      <RadioGroup
        defaultValue={value}
        value={value}
        onValueChange={(value) => onChange(value as TransactionType)}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="expense" id="expense" />
          <Label htmlFor="expense" className="cursor-pointer">
            הוצאה
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="income" id="income" />
          <Label htmlFor="income" className="cursor-pointer">
            הכנסה
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
