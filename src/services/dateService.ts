import { format, parse, isValid } from 'date-fns';
import { he } from 'date-fns/locale';

export class DateService {
  private static readonly DEFAULT_FORMAT = 'dd/MM/yyyy';
  private static readonly SUPPORTED_FORMATS = [
    'dd/MM/yyyy',
    'dd/MM/yy',
    'yyyy-MM-dd',
    'dd-MM-yyyy',
    'dd-MM-yy',
    'dd.MM.yyyy',
    'dd.MM.yy'
  ];
  
  static parseDate(dateStr: string | null | undefined, formatStr: string = this.DEFAULT_FORMAT): Date | null {
    if (!dateStr) {
      console.log('תאריך ריק');
      return null;
    }

    // ניקוי התאריך מתווים מיוחדים
    const cleanDateStr = dateStr.toString().replace(/[^\d/.-]/g, '');
    console.log('תאריך לאחר ניקוי:', cleanDateStr);

    // ניסיון לפרסר את התאריך בכל הפורמטים הנתמכים
    for (const format of this.SUPPORTED_FORMATS) {
      try {
        const parsedDate = parse(cleanDateStr, format, new Date());
        if (isValid(parsedDate)) {
          console.log(`הצלחה בפרסור תאריך עם פורמט ${format}:`, parsedDate);
          return parsedDate;
        }
      } catch {
        console.log(`כשל בפרסור תאריך עם פורמט ${format}`);
        continue;
      }
    }

    // אם לא הצלחנו לפרסר, ננסה לזהות את הפורמט לפי התבנית
    const dateMatch = cleanDateStr.match(/(\d{1,2})[-.\/](\d{1,2})[-.\/](\d{2,4})/);
    if (dateMatch) {
      console.log('נמצאה התאמה לתבנית תאריך:', dateMatch);
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      let year = dateMatch[3];
      if (year.length === 2) year = '20' + year;
      
      try {
        const dateString = `${year}-${month}-${day}`;
        console.log('מנסה לפרסר תאריך:', dateString);
        const parsedDate = new Date(dateString);
        if (isValid(parsedDate)) {
          console.log('הצלחה בפרסור תאריך:', parsedDate);
          return parsedDate;
        }
      } catch (error) {
        console.error('שגיאה בפרסור תאריך:', error);
      }
    }

    console.log('לא הצלחנו לפרסר את התאריך:', dateStr);
    return null;
  }

  static formatDate(date: Date | null, formatStr: string = this.DEFAULT_FORMAT): string {
    if (!date || !isValid(date)) {
      return '';
    }

    try {
      return format(date, formatStr, { locale: he });
    } catch (error) {
      console.error('שגיאה בפורמוט תאריך:', error);
      return '';
    }
  }

  static validateDateFormat(dateStr: string, formatStr: string = this.DEFAULT_FORMAT): boolean {
    const parsedDate = this.parseDate(dateStr, formatStr);
    return parsedDate !== null && isValid(parsedDate);
  }

  static convertDateFormat(
    dateStr: string, 
    fromFormat: string, 
    toFormat: string = this.DEFAULT_FORMAT
  ): string {
    const parsedDate = this.parseDate(dateStr, fromFormat);
    if (!parsedDate || !isValid(parsedDate)) return '';
    return this.formatDate(parsedDate, toFormat);
  }

  static getHebrewMonthName(date: Date): string {
    if (!isValid(date)) return '';
    return format(date, 'MMMM', { locale: he });
  }

  static getHebrewDayName(date: Date): string {
    if (!isValid(date)) return '';
    return format(date, 'EEEE', { locale: he });
  }
} 