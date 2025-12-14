import React, { useState, useEffect } from 'react'
import { getWorkoutData, saveWorkoutData } from '../utils/storage'
import { getSyncStatus, manualSync } from '../utils/storage'
import { getDeviceId } from '../utils/supabase'
import './Settings.css'

const Settings = () => {
  const [syncStatus, setSyncStatus] = useState({ configured: false, lastSync: null })
  const [syncing, setSyncing] = useState(false)
  const [deviceId] = useState(getDeviceId())

  useEffect(() => {
    setSyncStatus(getSyncStatus())
  }, [])

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      const result = await manualSync()
      if (result.success) {
        setSyncStatus(getSyncStatus())
        alert('Sync successful!')
      } else {
        alert('Sync failed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Sync error: ' + error.message)
    } finally {
      setSyncing(false)
    }
  }

  const handleExport = () => {
    const data = getWorkoutData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (confirm('This will replace all your current workout data. Are you sure?')) {
          saveWorkoutData(data)
          alert('Data imported successfully!')
          window.location.reload()
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all workout data? This cannot be undone.')) {
      if (confirm('This is your last chance. All data will be permanently deleted.')) {
        localStorage.removeItem('hybrid-workout-data')
        alert('All data cleared.')
        window.location.reload()
      }
    }
  }

  return (
    <div className="settings">
      <h1>Settings</h1>
      
      {syncStatus.configured && (
        <div className="settings-section">
          <h2>Cloud Sync</h2>
          
          <div className="setting-item">
            <h3>Sync Status</h3>
            <p>
              <strong>Device ID:</strong> {deviceId.substring(0, 20)}...
            </p>
            <p>
              <strong>Last Synced:</strong> {syncStatus.lastSync 
                ? new Date(syncStatus.lastSync).toLocaleString() 
                : 'Never'}
            </p>
            <button 
              onClick={handleManualSync} 
              className="action-button"
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      )}

      <div className="settings-section">
        <h2>Data Management</h2>
        
        <div className="setting-item">
          <h3>Export Data</h3>
          <p>Download all your workout data as a JSON file for backup.</p>
          <button onClick={handleExport} className="action-button">
            Export Data
          </button>
        </div>

        <div className="setting-item">
          <h3>Import Data</h3>
          <p>Restore workout data from a previously exported JSON file.</p>
          <label className="file-input-label">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <span className="action-button">Choose File to Import</span>
          </label>
        </div>

        <div className="setting-item danger">
          <h3>Clear All Data</h3>
          <p>Permanently delete all workout data. This action cannot be undone.</p>
          <button onClick={handleClear} className="danger-button">
            Clear All Data
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2>About</h2>
        <div className="setting-item">
          <p>
            <strong>Hybrid Workout Tracker</strong> helps you track your "3 runs + 3 lifts + 1 recovery" hybrid week.
          </p>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            {syncStatus.configured 
              ? 'Your data is synced to the cloud and stored locally. You can access it from any device with the same device ID.'
              : 'Your data is stored locally in your browser. Configure Supabase in .env to enable cloud sync.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings

