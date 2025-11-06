const XLSX = require('xlsx');
const fs = require('fs');

// מיפוי קטגוריות - מבוסס על הקטגוריות המדויקות שמופיעות בקובץ הייצוא של ישרכרט מקס
const ISRACARD_CATEGORY_MAPPING = {
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

function parseIsracardDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
}

function parseInstallments(notes) {
  if (!notes) return null;
  const match = notes.match(/תשלום (\d+) מתוך (\d+)/);
  if (match) {
    return { current: parseInt(match[1]), total: parseInt(match[2]) };
  }
  return null;
}

function mapCategory(isracardCategory) {
  return ISRACARD_CATEGORY_MAPPING[isracardCategory] || 'אחר';
}

try {
  console.log('📂 קורא קובץ...');
  const workbook = XLSX.readFile('./transaction-details_export_1762368625954.xlsx');

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    range: 3,
    defval: ''
  });

  console.log('📋 כותרות:', jsonData[0]);
  console.log('\n📊 מעבד עסקאות...\n');

  const transactions = [];

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];

    if (!row[0] || !row[1]) continue;

    const תאריךעסקה = row[0]?.toString() || '';
    const שםביתעסק = row[1]?.toString() || '';
    const קטגוריה = row[2]?.toString() || '';
    const כרטיס = row[3]?.toString() || '';
    const סכוםחיוב = parseFloat(row[5]?.toString().replace(/[^\d.-]/g, '') || '0');
    const הערות = row[10]?.toString() || '';

    const installments = parseInstallments(הערות);

    const transaction = {
      תאריך: parseIsracardDate(תאריךעסקה),
      תיאור: שםביתעסק,
      סכום: Math.abs(סכוםחיוב),
      סוג: 'expense',
      'קטגוריה ישרכרט': קטגוריה,
      'קטגוריה מערכת': mapCategory(קטגוריה),
      כרטיס: כרטיס,
      תשלומים: installments ? `${installments.current}/${installments.total}` : 'לא',
      הערות: הערות
    };

    transactions.push(transaction);
  }

  console.log(`✅ נמצאו ${transactions.length} עסקאות\n`);

  // הצג 5 דוגמאות
  console.log('📝 דוגמאות עסקאות:');
  console.log('='.repeat(100));
  for (let i = 0; i < Math.min(5, transactions.length); i++) {
    const t = transactions[i];
    console.log(`\n${i + 1}. ${t.תיאור}`);
    console.log(`   תאריך: ${t.תאריך} | סכום: ₪${t.סכום}`);
    console.log(`   קטגוריה: ${t['קטגוריה ישרכרט']} → ${t['קטגוריה מערכת']}`);
    console.log(`   תשלומים: ${t.תשלומים} | כרטיס: ${t.כרטיס}`);
    if (t.הערות) console.log(`   הערות: ${t.הערות}`);
  }

  // סטטיסטיקות
  console.log('\n' + '='.repeat(100));
  console.log('\n📊 סטטיסטיקות:');
  console.log(`   סה"כ עסקאות: ${transactions.length}`);
  console.log(`   סה"כ סכום: ₪${transactions.reduce((sum, t) => sum + t.סכום, 0).toFixed(2)}`);

  const categoryCounts = {};
  transactions.forEach(t => {
    const cat = t['קטגוריה מערכת'];
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  console.log('\n   פילוח לפי קטגוריות:');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} עסקאות`);
    });

  // שמור לקובץ JSON
  fs.writeFileSync('parsed-transactions.json', JSON.stringify(transactions, null, 2), 'utf8');
  console.log('\n💾 הקובץ נשמר ב: parsed-transactions.json');

} catch (error) {
  console.error('❌ שגיאה:', error.message);
}
