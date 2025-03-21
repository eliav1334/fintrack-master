
/**
 * פונקציות עזר לאימות נתונים באחסון המקומי
 */

/**
 * פונקציה לאימות נתונים מה-localStorage
 * @param data הנתונים לאימות
 * @returns האם הנתונים תקינים
 */
export const validateStoredData = (data: string | null): boolean => {
  if (!data) return false;
  
  try {
    const parsedData = JSON.parse(data);
    return (
      parsedData !== null && 
      typeof parsedData === 'object' && 
      (!parsedData.transactions || Array.isArray(parsedData.transactions))
    );
  } catch (error) {
    console.error("שגיאה באימות נתונים:", error);
    return false;
  }
};
