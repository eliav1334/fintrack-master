import * as XLSX from 'xlsx';
import { DateService } from './dateService';
import { ImportedTransaction, TransactionType, TransactionStatus, TransactionCategory } from '@/types/finance';

interface FileFormat {
  id: string;
  name: string;
  description: string;
  headers: string[];
  requiredColumns: string[];
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface ParsedData {
  transactions: ImportedTransaction[];
}

export class FileService {
  private static readonly SUPPORTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static async validateFile(file: File): Promise<ValidationResult> {
    try {
      // בדיקת סוג הקובץ
      const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      if (!this.SUPPORTED_EXTENSIONS.includes(extension)) {
        return {
          isValid: false,
          error: `סוג הקובץ אינו נתמך. הקבצים הנתמכים הם: ${this.SUPPORTED_EXTENSIONS.join(', ')}`
        };
      }

      // בדיקת גודל הקובץ
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: 'גודל הקובץ חורג מהמותר (מקסימום 10MB)'
        };
      }

      const data = await this.readFileContent(file);
      console.log('תוכן הקובץ נקרא:', {
        headers: data.headers,
        rowCount: data.rows.length
      });

      if (!data || !data.headers || !data.rows || data.rows.length === 0) {
        return { 
          isValid: false, 
          error: 'הקובץ ריק או לא בפורמט תקין' 
        };
      }

      if (data.headers.length === 0) {
        return {
          isValid: false,
          error: 'לא נמצאו כותרות עמודות בקובץ'
        };
      }

      // מילות מפתח לזיהוי העמודות הנדרשות
      const requiredColumnKeywords = {
        date: ['תאריך', 'date'],
        amount: ['סכום', 'amount', 'חיוב', 'זכות'],
        description: ['תיאור', 'description', 'פרטים', 'שם בית עסק']
      };

      console.log('בודק עמודות נדרשות עם מילות המפתח:', requiredColumnKeywords);

      // בדיקת עמודות נדרשות
      const missingColumns = Object.entries(requiredColumnKeywords).filter(([col, keywords]) => {
        const found = data.headers.some(header => {
          if (!header) return false;
          return keywords.some(keyword => {
            const isMatch = header.toString().toLowerCase().includes(keyword.toLowerCase());
            console.log(`בודק כותרת "${header}" עבור מילת מפתח "${keyword}": ${isMatch}`);
            return isMatch;
          });
        });
        console.log(`עמודה ${col} נמצאה: ${found}`);
        return !found;
      }).map(([col]) => col);

      if (missingColumns.length > 0) {
        console.log('עמודות חסרות:', missingColumns);
        const hebrewColumns = {
          date: 'תאריך',
          amount: 'סכום',
          description: 'תיאור'
        };
        return { 
          isValid: false, 
          error: `לא נמצאו העמודות הנדרשות: ${missingColumns.map(col => hebrewColumns[col as keyof typeof hebrewColumns]).join(', ')}` 
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('שגיאה בבדיקת הקובץ:', error);
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'שגיאה בקריאת הקובץ' 
      };
    }
  }

  static async parseFile(file: File): Promise<ParsedData> {
    try {
      const data = await this.readFileContent(file);
      console.log('תוכן הקובץ נקרא לעיבוד:', {
        headers: data.headers,
        rowCount: data.rows.length
      });

      // מיפוי אוטומטי של העמודות
      const mappedHeaders = this.autoMapHeaders(data.headers);
      console.log('מיפוי כותרות:', mappedHeaders);

      // בדיקה שכל העמודות הנדרשות נמצאו
      const requiredColumns = ['date', 'amount', 'description'];
      const missingColumns = requiredColumns.filter(col => mappedHeaders[col] === -1);

      if (missingColumns.length > 0) {
        console.error('עמודות חסרות:', missingColumns);
        throw new Error(`לא נמצאו העמודות הנדרשות: ${missingColumns.join(', ')}`);
      }

      const transactions = data.rows
        .filter(row => row && Object.keys(row).length > 0) // מסנן שורות ריקות
        .map((row, index) => {
          console.log(`מעבד שורה ${index}:`, row);
          
          const amount = this.extractAmount(row[mappedHeaders.amount]);
          if (amount === 0) {
            console.log(`דילוג על שורה ${index} - סכום 0`);
            return null;
          }

          const description = row[mappedHeaders.description]?.toString().trim();
          if (!description) {
            console.log(`דילוג על שורה ${index} - תיאור ריק`);
            return null;
          }

          try {
            const date = DateService.parseDate(row[mappedHeaders.date]);
            if (!date) {
              console.log(`דילוג על שורה ${index} - תאריך לא תקין`);
              return null;
            }

            const transaction = {
              description,
              amount,
              date: date.toISOString().split('T')[0],
              category: (row[mappedHeaders.category] || 'כללי') as TransactionCategory,
              type: (amount >= 0 ? 'income' : 'expense') as TransactionType,
              status: 'הושלם' as TransactionStatus
            };
            console.log(`עסקה נוצרה:`, transaction);
            return transaction;
          } catch (error) {
            console.error(`שגיאה בעיבוד שורה ${index}:`, error);
            return null;
          }
        })
        .filter((transaction): transaction is ImportedTransaction => transaction !== null);

      console.log(`סך הכל נוצרו ${transactions.length} עסקאות`);
      return { transactions };
    } catch (error) {
      console.error('שגיאה בעיבוד הקובץ:', error);
      throw error;
    }
  }

  private static async readFileContent(file: File): Promise<{ headers: string[], rows: any[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          if (file.name.toLowerCase().endsWith('.csv')) {
            const content = e.target?.result as string;
            if (!content) {
              throw new Error('תוכן הקובץ ריק');
            }

            const rows = content.split('\n')
              .map(row => row.trim())
              .filter(row => row.length > 0)
              .map(row => row.split(','));

            console.log('שורות CSV:', rows.length);
            
            if (rows.length < 2) {
              throw new Error('הקובץ חייב להכיל לפחות כותרות ושורת נתונים אחת');
            }

            resolve({
              headers: rows[0].map(header => header.trim()),
              rows: rows.slice(1).filter(row => row.length === rows[0].length)
            });
          } else {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            if (workbook.SheetNames.length === 0) {
              throw new Error('לא נמצאו גליונות בקובץ האקסל');
            }

            console.log('גליונות אקסל:', workbook.SheetNames);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[];
            
            if (!jsonData || jsonData.length < 2) {
              throw new Error('הקובץ חייב להכיל לפחות כותרות ושורת נתונים אחת');
            }

            console.log('נתוני אקסל:', {
              rowCount: jsonData.length,
              firstRow: jsonData[0]
            });

            resolve({
              headers: (jsonData[0] || []).map(header => (header?.toString() || '').trim()),
              rows: jsonData.slice(1)
            });
          }
        } catch (error) {
          console.error('שגיאה בקריאת הקובץ:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error('שגיאת FileReader');
        reject(new Error('שגיאה בקריאת הקובץ'));
      };

      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  private static autoMapHeaders(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {
      date: -1,
      amount: -1,
      description: -1,
      category: -1
    };

    // מיפוי אוטומטי לפי מילות מפתח
    const dateKeywords = ['תאריך', 'date'];
    const amountKeywords = ['סכום', 'amount', 'חיוב', 'זכות'];
    const descriptionKeywords = ['תיאור', 'description', 'פרטים', 'שם בית עסק'];
    const categoryKeywords = ['קטגוריה', 'category', 'סוג'];

    console.log('ממפה כותרות:', headers);
    headers.forEach((header, index) => {
      if (!header) {
        console.log(`דילוג על כותרת ריקה באינדקס ${index}`);
        return;
      }

      const headerLower = header.toString().toLowerCase();
      console.log(`מעבד כותרת: "${headerLower}" באינדקס ${index}`);

      if (dateKeywords.some(keyword => headerLower.includes(keyword.toLowerCase()))) {
        console.log(`נמצאה כותרת תאריך: "${header}"`);
        mapping.date = index;
      }
      if (amountKeywords.some(keyword => headerLower.includes(keyword.toLowerCase()))) {
        console.log(`נמצאה כותרת סכום: "${header}"`);
        mapping.amount = index;
      }
      if (descriptionKeywords.some(keyword => headerLower.includes(keyword.toLowerCase()))) {
        console.log(`נמצאה כותרת תיאור: "${header}"`);
        mapping.description = index;
      }
      if (categoryKeywords.some(keyword => headerLower.includes(keyword.toLowerCase()))) {
        console.log(`נמצאה כותרת קטגוריה: "${header}"`);
        mapping.category = index;
      }
    });

    console.log('מיפוי כותרות סופי:', mapping);
    return mapping;
  }

  private static extractAmount(value: string | number): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    // ניקוי תווים מיוחדים והמרה למספר
    const cleanValue = value.toString()
      .replace(/[^\d.-]/g, '')
      .replace(/^\./, '0.') // מוסיף 0 לפני נקודה בהתחלה
      .replace(/^-\./, '-0.'); // מוסיף 0 לפני נקודה שלילית בהתחלה

    const amount = parseFloat(cleanValue) || 0;
    console.log(`חילוץ סכום: ${amount} מערך: ${value}`);
    return amount;
  }
}