// Utility functions to aggregate data for charts

import { getWorkoutData, getCurrentWeekKey, getDateKeyForDay } from './storage'
import { parseLocalDate, formatDateKey } from './dateUtils'

// Get all weeks with data
export const getAllWeeksData = () => {
  const allData = getWorkoutData()
  const weeksMap = new Map()
  
  Object.keys(allData).forEach(dateKey => {
    const day = allData[dateKey]
    if (day?.weekKey) {
      if (!weeksMap.has(day.weekKey)) {
        weeksMap.set(day.weekKey, [])
      }
      weeksMap.get(day.weekKey).push(day)
    }
  })
  
  return weeksMap
}

// Get last N weeks of data (default 8 weeks)
export const getRecentWeeksData = (numWeeks = 8) => {
  const weeksMap = getAllWeeksData()
  const currentWeek = getCurrentWeekKey()
  const weeks = []
  
  // Generate week keys for the last N weeks (starting from today, using device's local time)
  for (let i = 0; i < numWeeks; i++) {
    const weekDate = parseLocalDate(currentWeek)
    weekDate.setDate(weekDate.getDate() - (i * 7))
    const weekKey = formatDateKey(weekDate)
    
    // Get all days for this week (7 days starting from weekKey)
    const weekDays = []
    for (let j = 0; j < 7; j++) {
      const dayDate = parseLocalDate(weekKey)
      dayDate.setDate(dayDate.getDate() + j)
      const dayKey = formatDateKey(dayDate)
      const allData = getWorkoutData()
      if (allData[dayKey]) {
        weekDays.push(allData[dayKey])
      }
    }
    
    weeks.push({
      weekKey,
      weekLabel: formatWeekLabel(weekKey),
      data: weekDays
    })
  }
  
  return weeks.reverse() // Oldest to newest
}

// Format week label for display
const formatWeekLabel = (weekKey) => {
  const date = new Date(weekKey)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Calculate weekly running distance
export const getWeeklyRunningDistance = (weeks) => {
  return weeks.map(week => {
    let totalDistance = 0
    week.data.forEach(day => {
      if (day.type === 'run' && day.totalDistance) {
        totalDistance += parseFloat(day.totalDistance) || 0
      }
    })
    return {
      week: week.weekLabel,
      distance: parseFloat(totalDistance.toFixed(1))
    }
  })
}

// Calculate weekly sets per muscle group
export const getWeeklySetsByGroup = (weeks) => {
  return weeks.map(week => {
    let pushSets = 0
    let pullSets = 0
    let legSets = 0
    
    week.data.forEach(day => {
      if (day.type === 'lift' && day.exercises) {
        const completedExercises = day.exercises.filter(e => e.completed)
        const sets = completedExercises.reduce((sum, e) => sum + (parseInt(e.sets) || 0), 0)
        
        if (day.focus === 'push') pushSets += sets
        else if (day.focus === 'pull') pullSets += sets
        else if (day.focus === 'legs') legSets += sets
      }
    })
    
    return {
      week: week.weekLabel,
      push: pushSets,
      pull: pullSets,
      legs: legSets
    }
  })
}

// Calculate average running pace by type
export const getAveragePaceByType = (weeks) => {
  const paceData = {
    speed: [],
    easy: [],
    long: []
  }
  
  weeks.forEach(week => {
    week.data.forEach(day => {
      if (day.type === 'run' && day.averagePace && day.runType) {
        const pace = parseFloat(day.averagePace)
        if (!isNaN(pace) && pace > 0) {
          paceData[day.runType]?.push(pace)
        }
      }
    })
  })
  
  const averages = {}
  Object.keys(paceData).forEach(type => {
    if (paceData[type].length > 0) {
      const sum = paceData[type].reduce((a, b) => a + b, 0)
      averages[type] = parseFloat((sum / paceData[type].length).toFixed(2))
    }
  })
  
  return averages
}

// Calculate workout completion rate
export const getWorkoutCompletionRate = (weeks) => {
  return weeks.map(week => {
    const totalWorkouts = 6 // 3 runs + 3 lifts (excluding Sunday)
    let completed = 0
    
    week.data.forEach(day => {
      if (day.completed) {
        completed++
      } else if (day.type === 'run' && day.totalDistance) {
        completed++ // Count runs with distance as completed
      } else if (day.type === 'lift' && day.exercises?.some(e => e.completed)) {
        completed++ // Count lifts with at least one exercise as completed
      }
    })
    
    return {
      week: week.weekLabel,
      completed,
      total: totalWorkouts,
      rate: totalWorkouts > 0 ? Math.round((completed / totalWorkouts) * 100) : 0
    }
  })
}

// Get current week's pace data for comparison
export const getCurrentWeekPaceData = (weekData) => {
  const paceData = {
    speed: null,
    easy: null,
    long: null
  }
  
  Object.values(weekData).forEach(day => {
    if (day.type === 'run' && day.averagePace && day.runType) {
      const pace = parseFloat(day.averagePace)
      if (!isNaN(pace) && pace > 0) {
        paceData[day.runType] = pace
      }
    }
  })
  
  return paceData
}

