import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { setupPrintParensStripper } from '@/lib/stripPrintParens'

setupPrintParensStripper();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)