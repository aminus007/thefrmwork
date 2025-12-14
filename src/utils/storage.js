// Storage utilities for workout data with Supabase sync

import { supabase, getDeviceId } from './supabase'
import { getTodayDateKey, parseLocalDate, formatDateKey } from './dateUtils'

const STORAGE_KEY = 'hybrid-workout-data';
const SYNC_TIMESTAMP_KEY = 'hybrid-workout-sync-timestamp';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return url && key && url !== '' && key !== ''
}

// Sync data to Supabase
const syncToSupabase = async (data) => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, skipping sync')
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const deviceId = getDeviceId()
    const { error } = await supabase
      .from('workout_data')
      .upsert({
        device_id: deviceId,
        data: data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'device_id'
      })

    if (error) throw error

    // Update local sync timestamp
    localStorage.setItem(SYNC_TIMESTAMP_KEY, new Date().toISOString())
    return { success: true }
  } catch (error) {
    console.error('Error syncing to Supabase:', error)
    return { success: false, error: error.message }
  }
}

// Pull data from Supabase
const pullFromSupabase = async () => {
  if (!isSupabaseConfigured()) {
    return null
  }

  try {
    if (!supabase) {
      return null
    }
    
    const deviceId = getDeviceId()
    const { data, error } = await supabase
      .from('workout_data')
      .select('data, updated_at')
      .eq('device_id', deviceId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    if (data) {
      localStorage.setItem(SYNC_TIMESTAMP_KEY, data.updated_at)
      return data.data
    }
    return null
  } catch (error) {
    console.error('Error pulling from Supabase:', error)
    return null
  }
}

// Initialize: try to pull from Supabase, fallback to local
export const initializeData = async () => {
  if (!isSupabaseConfigured()) {
    return getWorkoutData()
  }

  try {
    const cloudData = await pullFromSupabase()
    const localData = getWorkoutData()
    
    if (cloudData && Object.keys(cloudData).length > 0) {
      // Merge: cloud data takes precedence, but keep local if newer
      const merged = { ...cloudData }
      Object.keys(localData).forEach(key => {
        const localTimestamp = localData[key]?.updatedAt
        const cloudTimestamp = cloudData[key]?.updatedAt
        
        if (!cloudTimestamp || (localTimestamp && new Date(localTimestamp) > new Date(cloudTimestamp))) {
          merged[key] = localData[key]
        }
      })
      
      saveWorkoutData(merged)
      return merged
    }
    
    return localData
  } catch (error) {
    console.error('Error initializing data:', error)
    return getWorkoutData()
  }
}

export const getWorkoutData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading workout data:', error);
    return {};
  }
};

export const saveWorkoutData = async (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Sync to Supabase in background
    if (isSupabaseConfigured()) {
      syncToSupabase(data).catch(err => {
        console.error('Background sync failed:', err)
      })
    }
    
    return true;
  } catch (error) {
    console.error('Error saving workout data:', error);
    return false;
  }
};

export const getDayData = (dateKey) => {
  const data = getWorkoutData();
  return data[dateKey] || null;
};

export const saveDayData = async (dateKey, dayData) => {
  const data = getWorkoutData();
  // Use device's local time for updatedAt
  const now = new Date()
  dayData.updatedAt = now.toISOString() // ISO string for consistency, but created from local time
  data[dateKey] = dayData;
  return await saveWorkoutData(data);
};

export const getAllWeeks = () => {
  const data = getWorkoutData();
  const weeks = new Set();
  Object.keys(data).forEach(dateKey => {
    if (data[dateKey]?.weekKey) {
      weeks.add(data[dateKey].weekKey);
    }
  });
  return Array.from(weeks).sort().reverse();
};

export const getWeekData = (weekKey) => {
  const data = getWorkoutData();
  const weekData = {};
  Object.keys(data).forEach(dateKey => {
    if (data[dateKey]?.weekKey === weekKey) {
      weekData[dateKey] = data[dateKey];
    }
  });
  return weekData;
};

// Get current week's start date (today's date) - uses device's local time
export const getCurrentWeekKey = () => {
  return getTodayDateKey()
}

// Get date key for a specific day of the week (0 = first day, 6 = 7th day)
// Uses device's local time
export const getDateKeyForDay = (weekKey, dayIndex) => {
  const startDate = parseLocalDate(weekKey)
  const targetDate = new Date(startDate)
  targetDate.setDate(startDate.getDate() + dayIndex)
  return formatDateKey(targetDate)
}

// Manual sync function
export const manualSync = async () => {
  const data = getWorkoutData()
  return await syncToSupabase(data)
}

// Get sync status
export const getSyncStatus = () => {
  if (!isSupabaseConfigured()) {
    return { configured: false, lastSync: null }
  }
  
  const lastSync = localStorage.getItem(SYNC_TIMESTAMP_KEY)
  return {
    configured: true,
    lastSync: lastSync ? new Date(lastSync) : null
  }
}
