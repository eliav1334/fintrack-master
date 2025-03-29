import { Groq } from "groq-sdk";

// יצירת מופע של Groq
export const groq = new Groq({
  apiKey: process.env.VITE_GROQ_API_KEY,
});

// פונקציית עזר לשימוש ב-Groq
export async function generateWithGroq(prompt: string) {
  if (!process.env.VITE_GROQ_API_KEY) {
    throw new Error("מפתח API של Groq לא נמצא. אנא הגדר את המשתנה הסביבתי VITE_GROQ_API_KEY");
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "אתה מומחה React ו-TypeScript. תפקידך לעזור בפיתוח קוד איכותי ופתרון בעיות.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.95,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error("לא התקבלה תשובה מ-Groq");
    }

    return response;
  } catch (error) {
    console.error("שגיאה בשימוש ב-Groq:", error);
    if (error instanceof Error) {
      throw new Error(`שגיאה בשימוש ב-Groq: ${error.message}`);
    }
    throw new Error("שגיאה לא ידועה בשימוש ב-Groq");
  }
} 