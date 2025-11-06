import * as XLSX from 'xlsx';
import { Transaction } from '@/types/finance';

// מיפוי קטגוריות ישרכרט מקס לקטגוריות המערכת
// מבוסס על הקטגוריות המדויקות שמופיעות בקובץ הייצוא של ישרכרט מקס
const ISRACARD_CATEGORY_MAPPING: Record<string, string> = {
  // מזון ושתייה
  'מזון וצריכה': 'מזון',
  'מסעדות קפה וברים': 'מזון',
  'מסעדות, קפה וברים': 'מזון',
  'מזון ושתייה': 'מזון',
  'סופרמרקטים': 'מזון',
  'מסעדות': 'מזון',
  'קפה': 'מזון',

  // תחבורה
  'תחבורה ורכבים': 'תחבורה',
  'תחבורה': 'תחבורה',
  'דלק': 'תחבורה',
  'חניונים': 'תחבורה',
  'תחבורה ציבורית': 'תחבורה',

  // ביגוד והנעלה
  'אופנה': 'ביגוד והנעלה',
  'ביגוד והנעלה': 'ביגוד והנעלה',

  // קניות
  'חשמל ומחשבים': 'קניות',
  'קוסמטיקה וטיפוח': 'קניות',
  'קניות': 'קניות',
  'מוצרי חשמל': 'קניות',
  'מתנות': 'קניות',

  // דיור
  'עיצוב הבית': 'דיור',
  'עירייה וממשלה': 'דיור',
  'דיור': 'דיור',
  'ריהוט': 'דיור',

  // בריאות
  'רפואה ובתי מרקחת': 'בריאות',
  'בריאות': 'בריאות',
  'בתי מרקחת': 'בריאות',
  'רופאים': 'בריאות',

  // בידור
  'בידור': 'בידור',
  'קולנוע': 'בידור',
  'ספורט': 'בידור',

  // חינוך
  'ספרים ודפוס': 'חינוך',
  'חינוך': 'חינוך',
  'ספרים': 'חינוך',

  // חשבונות
  'ביטוח': 'חשבונות',
  'שירותי תקשורת': 'חשבונות',
  'תקשורת': 'חשבונות',
  'כבלים ואינטרנט': 'חשבונות',

  // אחר
  'שונות': 'אחר',
  'העברת כספים': 'אחר',
};

/**
 * מנתח את פורמט התאריך של ישרכרט מקס
 * @param dateStr תאריך בפורמט DD-MM-YYYY או DD/MM/YYYY
 * @returns תאריך בפורמט ISO
 */
function parseIsracardDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  // תמיכה ב- DD-MM-YYYY או DD/MM/YYYY
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    const [day, month, year] = parts;
    // אם השנה היא 2 ספרות, הוסף 20 מלפנים
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * מזהה האם זו עסקת תשלומים
 * @param notes הערות העסקה
 * @returns פרטי תשלומים או null
 */
function parseInstallments(notes: string): { current: number; total: number } | null {
  if (!notes) return null;

  // זיהוי תבנית "תשלום X מתוך Y"
  const match = notes.match(/תשלום (\d+) מתוך (\d+)/);
  if (match) {
    return {
      current: parseInt(match[1]),
      total: parseInt(match[2])
    };
  }

  return null;
}

/**
 * ממפה קטגוריה של ישרכרט לקטגוריה של המערכת
 */
function mapCategory(isracardCategory: string): string {
  const mapped = ISRACARD_CATEGORY_MAPPING[isracardCategory];
  return mapped || 'אחר';
}

/**
 * מייבא קובץ Excel של ישרכרט מקס
 * @param file קובץ Excel
 * @returns מערך של עסקאות
 */
export async function parseIsracardMaxFile(file: File): Promise<Omit<Transaction, 'id'>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // קרא את הגיליון הראשון (עסקאות במועד החיוב)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // המר ל-JSON, התחל משורה 4 (שורות 0-2 הן כותרות מערכת, שורה 3 היא כותרות העמודות)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: 3, // התחל משורה 3 (0-indexed)
          defval: ''
        }) as any[][];

        const transactions: Omit<Transaction, 'id'>[] = [];

        // עבור על כל שורות הנתונים (מתחיל משורה 1, שורה 0 היא כותרות)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];

          // דלג על שורות ריקות
          if (!row[0] || !row[1]) continue;

          const תאריךעסקה = row[0]?.toString() || '';
          const שםביתעסק = row[1]?.toString() || '';
          const קטגוריה = row[2]?.toString() || '';
          const סכוםחיוב = parseFloat(row[5]?.toString().replace(/[^\d.-]/g, '') || '0');
          const הערות = row[10]?.toString() || '';

          // בדוק אם זו עסקת תשלומים
          const installments = parseInstallments(הערות);

          const transaction: Omit<Transaction, 'id'> = {
            date: parseIsracardDate(תאריךעסקה),
            description: שםביתעסק,
            amount: Math.abs(סכוםחיוב), // וודא שהסכום חיובי
            type: 'הוצאה', // ישרכרט מקס מציג רק הוצאות
            category: mapCategory(קטגוריה) as any,
            status: 'הושלם',
            notes: הערות || undefined,
            businessName: שםביתעסק,
            createdAt: new Date().toISOString()
          };

          // הוסף מידע על תשלומים אם קיים
          if (installments) {
            transaction.notes = `${הערות} | ${installments.current}/${installments.total}`;
          }

          transactions.push(transaction);
        }

        resolve(transactions);
      } catch (error) {
        console.error('Error parsing Isracard Max file:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * זיהוי אוטומטי האם קובץ זה הוא ישרכרט מקס
 * @param file קובץ לבדיקה
 * @returns true אם זה קובץ ישרכרט מקס
 */
export async function isIsracardMaxFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
          header: 1,
          range: 3,
          defval: ''
        }) as any[][];

        if (jsonData.length === 0) {
          resolve(false);
          return;
        }

        const headers = jsonData[0];

        // בדוק אם יש את הכותרות האופייניות לישרכרט מקס
        const hasIsracardHeaders = headers.includes('תאריך עסקה') &&
                                   headers.includes('שם בית העסק') &&
                                   headers.includes('4 ספרות אחרונות של כרטיס האשראי') &&
                                   headers.includes('סכום חיוב');

        resolve(hasIsracardHeaders);
      } catch {
        resolve(false);
      }
    };

    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file);
  });
}

export default {
  parseIsracardMaxFile,
  isIsracardMaxFile,
  ISRACARD_CATEGORY_MAPPING
};
