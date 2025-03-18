
import { Transaction, FileImportFormat } from "@/types";
import { findColumnIndices } from './headerDetection';

/**
 * מחלץ אינדקסים של עמודות ובודק תקינות
 */
export const extractColumnIndices = (
  headers: any[],
  format: FileImportFormat,
  sheetName?: string
) => {
  // קבלת אינדקסים של עמודות
  const indices = findColumnIndices(headers, format);
  
  // בדיקת עמודות חובה
  if (indices.dateIndex === -1 || indices.amountIndex === -1 || indices.descriptionIndex === -1) {
    console.error("Missing required columns in sheet", sheetName, ". Headers:", headers);
    const foundCols = [];
    if (indices.dateIndex !== -1) foundCols.push("תאריך");
    if (indices.amountIndex !== -1) foundCols.push("סכום");
    if (indices.descriptionIndex !== -1) foundCols.push("תיאור");
    
    throw new Error(`לא זוהו כל העמודות הנדרשות בגליון ${sheetName}. נמצאו: ${foundCols.join(", ")}`);
  }
  
  return indices;
};

/**
 * חילוץ ערכים מהשורה
 */
export const extractRowValues = (row: any[], indices: any) => {
  return {
    dateValue: row[indices.dateIndex],
    amountValue: row[indices.amountIndex],
    descriptionValue: row[indices.descriptionIndex],
    cardNumberValue: indices.cardNumberIndex !== -1 ? row[indices.cardNumberIndex] : null,
    transactionDateValue: indices.transactionDateIndex !== -1 ? row[indices.transactionDateIndex] : null,
    totalAmountValue: indices.totalAmountIndex !== -1 ? row[indices.totalAmountIndex] : null,
    installmentNumberValue: indices.installmentNumberIndex !== -1 ? row[indices.installmentNumberIndex] : null,
    totalInstallmentsValue: indices.totalInstallmentsIndex !== -1 ? row[indices.totalInstallmentsIndex] : null,
    businessCategoryValue: indices.businessCategoryIndex !== -1 ? row[indices.businessCategoryIndex] : null,
    businessIdentifierValue: indices.businessIdentifierIndex !== -1 ? row[indices.businessIdentifierIndex] : null,
    transactionCodeValue: indices.transactionCodeIndex !== -1 ? row[indices.transactionCodeIndex] : null
  };
};
