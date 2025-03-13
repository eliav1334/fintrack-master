
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// הגדרת שפת המסמך לעברית וכיוון מימין לשמאל
document.documentElement.lang = 'he';
document.documentElement.dir = 'rtl';

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("שגיאה: לא נמצא אלמנט שורש. לא ניתן לטעון את האפליקציה.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
