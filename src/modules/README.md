
# מבנה המודולים באפליקציה

אפליקציה זו בנויה בארכיטקטורה מודולרית המאפשרת הפרדה ברורה בין שכבות ויכולת לשלב בין המרכיבים השונים.

## מבנה כללי

האפליקציה מחולקת לשני מודולים עיקריים:

1. **מודול ליבה (`core`)** - מכיל את הלוגיקה העסקית הבסיסית של המערכת
2. **מודול תכונות (`features`)** - מכיל פיצ'רים ויכולות מתקדמות שנבנים מעל מודול הליבה

## מודול הליבה (`core`)

מודול הליבה מכיל את המרכיבים הבסיסיים של המערכת:

- `finance/types.ts` - טיפוסי נתונים בסיסיים
- `finance/reducers` - רדיוסרים לניהול המצב
- `finance/hooks` - הוקים בסיסיים לעבודה עם הנתונים
- `finance/FinanceContext.tsx` - הקונטקסט המרכזי של המערכת
- `finance/constants.ts` - קבועים וערכי ברירת מחדל

## מודול התכונות (`features`)

מודול התכונות מכיל יכולות מתקדמות יותר:

- `features/storage` - כל הפונקציונליות הקשורה לאחסון נתונים
- `features/cleanup` - ניהול ניקוי נתונים ועסקאות
- `features/reports` - תצוגת דוחות ומידע סטטיסטי
- `features/reset` - תכונות איפוס המערכת

## מודול האינטגרציה (`integration.ts`)

קובץ האינטגרציה מאפשר חיבור בין המודולים השונים. הוא מייצא ממשק מאוחד לשימוש בכל האפליקציה.

## איך המודולים עובדים יחד

1. **הזרמת נתונים:** 
   - מודול הליבה מספק את התשתית לניהול הנתונים והמצב
   - מודול התכונות משתמש בנתונים אלה ומרחיב את היכולות

2. **הפרדת אחריות:**
   - הליבה אחראית רק על הלוגיקה העסקית הבסיסית
   - התכונות אחראיות על יכולות מתקדמות וממשק משתמש

3. **נקודות חיבור:**
   - קובץ האינטגרציה מאפשר חיבור נקי בין המודולים
   - הקונטקסט הפיננסי משמש כנקודת חיבור מרכזית

## יתרונות המבנה

- **גמישות:** קל יותר להחליף או לשדרג מודול בלי לשנות את כל המערכת
- **תחזוקתיות:** כל מודול עומד בפני עצמו עם אחריות ברורה
- **בדיקות:** קל יותר לבדוק כל מודול בנפרד
- **מדרגיות:** אפשר להשתמש רק בחלק מהמודולים לפי הצורך
