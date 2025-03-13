
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TransactionFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  step?: string;
  min?: string;
  className?: string;
}

export const TransactionFormField: React.FC<TransactionFormFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  step,
  min,
  className,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        step={step}
        min={min}
        className={`transition-all ${className || ""}`}
      />
    </div>
  );
};
