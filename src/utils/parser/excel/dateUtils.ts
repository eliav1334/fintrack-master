
import { FileImportFormat } from "@/types";

/**
 * פורמט תאריך מנתוני אקסל למחרוזת תאריך תקנית
 */
export const formatExcelDate = (
  dateValue: any,
  format: FileImportFormat
): string => {
  let dateStr: string;
  
  if (dateValue instanceof Date) {
    dateStr = dateValue.toISOString().split('T')[0];
  } else if (typeof dateValue === 'number') {
    // תאריך אקסל מספרי
    const excelDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    dateStr = excelDate.toISOString().split('T')[0];
  } else {
    // טיפול במחרוזת תאריך
    dateStr = String(dateValue || '');
    
    // תיקון לפורמט תאריך בכרטיס אשראי ישראלי
    if ((format.name === "כרטיס אשראי ישראלי" || format.name.includes("אשראי")) && 
        typeof dateValue === 'string') {
      // נסיון לחלץ תאריך בפורמט DD/MM/YYYY או DD-MM-YYYY
      const dateMatch = dateValue.match(/(\d{1,2})[-.\/](\d{1,2})[-.\/](\d{2,4})/);
      if (dateMatch) {
        const day = dateMatch[1].padStart(2, '0');
        const month = dateMatch[2].padStart(2, '0');
        let year = dateMatch[3];
        if (year.length === 2) year = '20' + year;
        dateStr = `${year}-${month}-${day}`;
      }
    } else {
      // ניקוי התאריך (הסרת תווים מיוחדים)
      dateStr = dateStr.replace(/[^\d/.-]/g, '');
      
      // אם התאריך בפורמט עברי (DD/MM/YYYY)
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) {
        const parts = dateStr.split('/');
        dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }
  
  return dateStr;
};
