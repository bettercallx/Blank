import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { runMigrations } from './data/migrations.js'

// Upgrade any stored data to the current schema before the app reads it.
runMigrations()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
