import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link 
          to="/" 
          className={`nav-link nav-link-icon ${location.pathname === '/' ? 'active' : ''}`}
          aria-label="Dashboard"
          title="Dashboard"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span className="nav-link-text">Dashboard</span>
        </Link>
        <div className="nav-spacer"></div>
        <Link
          to="/settings"
          className={`nav-link nav-link-icon ${location.pathname === '/settings' ? 'active' : ''}`}
          aria-label="Settings"
          title="Settings"
        >
          <svg className="settings-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
          </svg>
          <span className="nav-link-text">Settings</span>
        </Link>
      </div>
    </nav>
  )
}

export default Navigation

