import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { setupPrintParensStripper } from '@/lib/stripPrintParens'

setupPrintParensStripper();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// إخفاء شاشة البدء بعد أن يرسم React واجهته الأولى (انتقال سلس)
const removeSplash = () => {
  const s = document.getElementById('app-splash');
  if (!s) return;
  s.style.transition = 'opacity .4s ease';
  s.style.opacity = '0';
  setTimeout(() => s.remove(), 450);
};
requestAnimationFrame(() => requestAnimationFrame(removeSplash));