// Date utility functions that use device's local time

/**
 * Get today's date in YYYY-MM-DD format using device's local time
 */
export const getTodayDateKey = () => {
  const today = new Date() // Uses device's local time
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format a date string (YYYY-MM-DD) to a Date object using local time
 */
export const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0) // Local time
}

/**
 * Format a Date object to YYYY-MM-DD using local time
 */
export const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if a date string (YYYY-MM-DD) is today (using device's local time)
 */
export const isToday = (dateString) => {
  const today = getTodayDateKey()
  return dateString === today
}

/**
 * Get the offset (0-6) for a weekday name relative to today.
 * e.g. if today is Friday and dayName is 'thursday', returns 6 (next thursday)
 */
export const getDayOffsetFromToday = (dayName) => {
  if (!dayName) return -1
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday
  const dayLabels = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const rotated = [...dayLabels.slice(dayOfWeek), ...dayLabels.slice(0, dayOfWeek)]
  return rotated.indexOf(String(dayName).toLowerCase())
}

/**
 * Get a date key for N days from a given date key
 */
export const addDays = (dateKey, days) => {
  const date = parseLocalDate(dateKey)
  date.setDate(date.getDate() + days)
  return formatDateKey(date)
}

/**
 * Compare two date keys (YYYY-MM-DD)
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareDates = (dateKey1, dateKey2) => {
  const date1 = parseLocalDate(dateKey1)
  const date2 = parseLocalDate(dateKey2)
  if (date1 < date2) return -1
  if (date1 > date2) return 1
  return 0
}

