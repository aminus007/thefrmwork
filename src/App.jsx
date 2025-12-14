import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import DayPage from './components/DayPage'
import Settings from './components/Settings'
import Navigation from './components/Navigation'
import SyncStatus from './components/SyncStatus'
import { initializeData } from './utils/storage'
import './App.css'

function App() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Initialize data from Supabase on app load
    initializeData()
      .then(() => {
        setInitialized(true)
        setError(null)
      })
      .catch((err) => {
        console.error('Error initializing data:', err)
        setError(err.message)
        // Still set initialized to true so the app can work with local data
        setInitialized(true)
      })
  }, [])

  if (!initialized) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading workout data...</p>
      </div>
    )
  }

  if (error) {
    console.warn('Initialization warning:', error)
  }

  return (
    <Router>
      <div className="app">
        <Navigation />
        <SyncStatus />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/day/:dayName" element={<DayPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
