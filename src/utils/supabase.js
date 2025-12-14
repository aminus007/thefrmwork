import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Replace these with your Supabase project credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Only create client if both URL and key are provided
let supabaseClient = null
if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '') {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
  }
}

export const supabase = supabaseClient

// Device ID management
const DEVICE_ID_KEY = 'hybrid-workout-device-id'

export const getDeviceId = () => {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY)
    if (!deviceId) {
      // Generate a unique device ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
    }
    return deviceId
  } catch (error) {
    console.error('Error accessing localStorage:', error)
    // Fallback to session-based ID if localStorage fails
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const resetDeviceId = () => {
  localStorage.removeItem(DEVICE_ID_KEY)
  return getDeviceId()
}

