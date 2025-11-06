const XLSX = require('xlsx');

try {
  // קרא את הקובץ
  const workbook = XLSX.readFile('./transaction-details_export_1762368625954.xlsx');

  console.log('📊 שמות הגליונות:', workbook.SheetNames);

  // קרא את הגיליון הראשון
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  // המר ל-JSON
  const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

  console.log('\n📋 כותרות (שורה ראשונה):');
  console.log(JSON.stringify(data[0], null, 2));

  console.log('\n📝 דוגמאות (5 שורות ראשונות):');
  for (let i = 0; i < Math.min(6, data.length); i++) {
    console.log(`\nשורה ${i}:`, JSON.stringify(data[i], null, 2));
  }

  console.log('\n📊 סה"כ שורות:', data.length);

  // ניתוח מבנה
  if (data.length > 0) {
    console.log('\n🔍 ניתוח עמודות:');
    const headers = data[0];
    headers.forEach((header, index) => {
      const sample = data[1] ? data[1][index] : '';
      console.log(`  [${index}] ${header}: "${sample}"`);
    });
  }

} catch (error) {
  console.error('❌ שגיאה:', error.message);
}
