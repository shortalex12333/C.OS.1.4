import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './frontend-ux/styles/globals.css'
import './frontend-ux/styles/animations.css'
import './frontend-ux/styles/enterpriseComponents.css'
import 'react-day-picker/dist/style.css'
import './frontend-ux/styles/calendar.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)