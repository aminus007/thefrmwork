import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { getCurrentWeekKey, getDateKeyForDay, getDayData, getWeekData } from '../utils/storage'
import { isToday, parseLocalDate, formatDateKey } from '../utils/dateUtils'
import {
  getRecentWeeksData,
  getWeeklyRunningDistance,
  getWeeklySetsByGroup,
  getAveragePaceByType,
  getWorkoutCompletionRate,
  getCurrentWeekPaceData,
} from '../utils/chartData'
import './Dashboard.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Dashboard = () => {
  const [weekData, setWeekData] = useState({})
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey())
  const [chartData, setChartData] = useState({
    runningDistance: null,
    setsByGroup: null,
    completionRate: null,
    paceComparison: null,
  })
  
  // Get day names starting from today (using device's local time)
  const getDayNames = () => {
    const today = new Date() // Device's local time
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayLabels = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    
    // Rotate arrays to start from today
    const rotatedDayLabels = [...dayLabels.slice(dayOfWeek), ...dayLabels.slice(0, dayOfWeek)]
    const rotatedShortNames = [...shortNames.slice(dayOfWeek), ...shortNames.slice(0, dayOfWeek)]
    
    return { dayLabels: rotatedDayLabels, shortNames: rotatedShortNames }
  }
  
  const { dayLabels, shortNames } = getDayNames()

  useEffect(() => {
    loadWeekData()
    loadChartData()
  }, [weekKey])

  const loadWeekData = () => {
    const data = getWeekData(weekKey)
    setWeekData(data)
  }

  const loadChartData = () => {
    const recentWeeks = getRecentWeeksData(8)
    
    // Weekly running distance
    const distanceData = getWeeklyRunningDistance(recentWeeks)
    const runningDistanceChart = {
      labels: distanceData.map(d => d.week),
      datasets: [
        {
          label: 'Distance (km)',
          data: distanceData.map(d => d.distance),
          borderColor: '#B8FF3B',
          backgroundColor: 'rgba(184, 255, 59, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
        },
      ],
    }

    // Sets by muscle group
    const setsData = getWeeklySetsByGroup(recentWeeks)
    const setsByGroupChart = {
      labels: setsData.map(d => d.week),
      datasets: [
        {
          label: 'Push',
          data: setsData.map(d => d.push),
          backgroundColor: '#B8FF3B',
        },
        {
          label: 'Pull',
          data: setsData.map(d => d.pull),
          backgroundColor: '#35E5FF',
        },
        {
          label: 'Legs',
          data: setsData.map(d => d.legs),
          backgroundColor: '#FF6B4A',
        },
      ],
    }

    // Completion rate
    const completionData = getWorkoutCompletionRate(recentWeeks)
    const completionRateChart = {
      labels: completionData.map(d => d.week),
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: completionData.map(d => d.rate),
          borderColor: '#35E5FF',
          backgroundColor: 'rgba(53, 229, 255, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
        },
      ],
    }

    // Pace comparison
    const avgPace = getAveragePaceByType(recentWeeks)
    const currentWeekData = getWeekData(weekKey)
    const currentPace = getCurrentWeekPaceData(currentWeekData)
    const paceComparisonChart = {
      labels: ['Speed', 'Easy', 'Long'],
      datasets: [
        {
          label: 'Average Pace (min/km)',
          data: [
            avgPace.speed || 0,
            avgPace.easy || 0,
            avgPace.long || 0,
          ],
          backgroundColor: '#B8FF3B',
        },
        {
          label: 'This Week (min/km)',
          data: [
            currentPace.speed || 0,
            currentPace.easy || 0,
            currentPace.long || 0,
          ],
          backgroundColor: '#35E5FF',
        },
      ],
    }

    setChartData({
      runningDistance: runningDistanceChart,
      setsByGroup: setsByGroupChart,
      completionRate: completionRateChart,
      paceComparison: paceComparisonChart,
    })
  }

  const getDayStatus = (dayIndex) => {
    const dateKey = getDateKeyForDay(weekKey, dayIndex)
    const day = weekData[dateKey]
    // Use device's local time to check if it's today
    const isTodayDate = isToday(dateKey)
    
    if (!day) {
      return isTodayDate ? 'today' : 'missed'
    }
    if (day.completed) return isTodayDate ? 'completed today' : 'completed'
    if (day.exercises?.some(e => e.completed) || day.totalTime || day.totalDistance) {
      return isTodayDate ? 'partial today' : 'partial'
    }
    return isTodayDate ? 'today' : 'missed'
  }

  const calculateMetrics = () => {
    let totalRunDistance = 0
    let totalRunTime = 0
    let speedRunDistance = 0
    let speedRunTime = 0
    let easyRunDistance = 0
    let easyRunTime = 0
    let longRunDistance = 0
    let longRunTime = 0
    let pushSets = 0
    let pullSets = 0
    let legSets = 0

    Object.values(weekData).forEach(day => {
      if (day.type === 'run') {
        const distance = parseFloat(day.totalDistance) || 0
        const time = parseFloat(day.totalTime) || 0
        totalRunDistance += distance
        totalRunTime += time

        if (day.runType === 'speed') {
          speedRunDistance += distance
          speedRunTime += time
        } else if (day.runType === 'easy') {
          easyRunDistance += distance
          easyRunTime += time
        } else if (day.runType === 'long') {
          longRunDistance += distance
          longRunTime += time
        }
      } else if (day.type === 'lift') {
        if (day.exercises) {
          const completedExercises = day.exercises.filter(e => e.completed)
          const sets = completedExercises.reduce((sum, e) => sum + (parseInt(e.sets) || 0), 0)
          
          if (day.focus === 'push') pushSets += sets
          else if (day.focus === 'pull') pullSets += sets
          else if (day.focus === 'legs') legSets += sets
        }
      }
    })

    return {
      totalRunDistance: totalRunDistance.toFixed(1),
      totalRunTime: Math.round(totalRunTime),
      speedRunDistance: speedRunDistance.toFixed(1),
      speedRunTime: Math.round(speedRunTime),
      easyRunDistance: easyRunDistance.toFixed(1),
      easyRunTime: Math.round(easyRunTime),
      longRunDistance: longRunDistance.toFixed(1),
      longRunTime: Math.round(longRunTime),
      pushSets,
      pullSets,
      legSets,
    }
  }

  const metrics = calculateMetrics()

  const changeWeek = (direction) => {
    const current = parseLocalDate(weekKey)
    current.setDate(current.getDate() + (direction === 'next' ? 7 : -7))
    setWeekKey(formatDateKey(current))
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#E5E7EB',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          padding: 15,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6B7280',
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.05)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6B7280',
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.05)',
        },
      },
    },
  }

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Weekly Dashboard</h1>
        <div className="week-navigation">
          <button onClick={() => changeWeek('prev')}>← Previous</button>
          <span className="week-label">
            Week of {parseLocalDate(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button onClick={() => changeWeek('next')}>Next →</button>
        </div>
      </div>

      <div className="week-calendar">
        {dayLabels.map((day, index) => {
          const status = getDayStatus(index)
          const dateKey = getDateKeyForDay(weekKey, index)
          const date = parseLocalDate(dateKey)
          return (
            <Link key={`${day}-${index}`} to={`/day/${day}`} className={`calendar-day ${status}`}>
              <div className="day-name">{shortNames[index]}</div>
              <div className="day-date">{date.getDate()}</div>
              <div className={`status-indicator ${status}`}>
                {status === 'completed' ? '✓' : status === 'partial' ? '~' : '○'}
              </div>
            </Link>
          )
        })}
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Running Totals</h3>
          <div className="metric-value">{metrics.totalRunDistance} km</div>
          <div className="metric-subvalue">{Math.floor(metrics.totalRunTime / 60)}h {metrics.totalRunTime % 60}m</div>
        </div>

        <div className="metric-card">
          <h3>Speed Run</h3>
          <div className="metric-value">{metrics.speedRunDistance} km</div>
          <div className="metric-subvalue">{Math.floor(metrics.speedRunTime / 60)}h {metrics.speedRunTime % 60}m</div>
        </div>

        <div className="metric-card">
          <h3>Easy Run</h3>
          <div className="metric-value">{metrics.easyRunDistance} km</div>
          <div className="metric-subvalue">{Math.floor(metrics.easyRunTime / 60)}h {metrics.easyRunTime % 60}m</div>
        </div>

        <div className="metric-card">
          <h3>Long Run</h3>
          <div className="metric-value">{metrics.longRunDistance} km</div>
          <div className="metric-subvalue">{Math.floor(metrics.longRunTime / 60)}h {metrics.longRunTime % 60}m</div>
        </div>

        <div className="metric-card">
          <h3>Push Sets</h3>
          <div className="metric-value">{metrics.pushSets}</div>
        </div>

        <div className="metric-card">
          <h3>Pull Sets</h3>
          <div className="metric-value">{metrics.pullSets}</div>
        </div>

        <div className="metric-card">
          <h3>Leg Sets</h3>
          <div className="metric-value">{metrics.legSets}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <h2 className="charts-title">Performance Analysis</h2>
        
        <div className="charts-grid">
          {/* Weekly Running Distance Chart */}
          <div className="chart-card">
            <h3>Weekly Running Distance</h3>
            <div className="chart-container">
              {chartData.runningDistance && (
                <Line data={chartData.runningDistance} options={lineChartOptions} />
              )}
            </div>
          </div>

          {/* Sets by Muscle Group Chart */}
          <div className="chart-card">
            <h3>Sets per Muscle Group</h3>
            <div className="chart-container">
              {chartData.setsByGroup && (
                <Bar data={chartData.setsByGroup} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Workout Completion Rate Chart */}
          <div className="chart-card">
            <h3>Workout Completion Rate</h3>
            <div className="chart-container">
              {chartData.completionRate && (
                <Line data={chartData.completionRate} options={lineChartOptions} />
              )}
            </div>
          </div>

          {/* Pace Comparison Chart */}
          <div className="chart-card">
            <h3>Average Pace Comparison</h3>
            <div className="chart-container">
              {chartData.paceComparison && (
                <Bar data={chartData.paceComparison} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
