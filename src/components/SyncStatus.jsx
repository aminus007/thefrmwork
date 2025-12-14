import React, { useState, useEffect } from 'react'
import { getSyncStatus, manualSync } from '../utils/storage'
import './SyncStatus.css'

const SyncStatus = () => {
  const [status, setStatus] = useState({ configured: false, lastSync: null })
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    updateStatus()
    // Update status every 30 seconds
    const interval = setInterval(updateStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = () => {
    setStatus(getSyncStatus())
  }

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      const result = await manualSync()
      if (result.success) {
        updateStatus()
      } else {
        alert('Sync failed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Sync error: ' + error.message)
    } finally {
      setSyncing(false)
    }
  }

  if (!status.configured) {
    return null // Don't show anything if Supabase isn't configured
  }

  const formatTime = (date) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="sync-status">
      <div className="sync-info">
        <span className="sync-label">Last synced:</span>
        <span className="sync-time">{formatTime(status.lastSync)}</span>
      </div>
      <button 
        onClick={handleManualSync} 
        className="sync-button"
        disabled={syncing}
        aria-label="Sync now"
      >
        {syncing ? '⏳' : '🔄'}
      </button>
    </div>
  )
}

export default SyncStatus

