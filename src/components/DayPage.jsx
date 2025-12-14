import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getCurrentWeekKey, getDateKeyForDay, getDayData, saveDayData } from '../utils/storage'
import { parseLocalDate, getDayOffsetFromToday } from '../utils/dateUtils'
import { workoutPlans } from '../utils/workoutPlans'
import './DayPage.css'

const DayPage = () => {
  const { dayName } = useParams()
  const plan = workoutPlans[dayName]
  const [dayData, setDayData] = useState(null)
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey())

  useEffect(() => {
    loadDayData()
  }, [dayName, weekKey])

  const loadDayData = () => {
    const dateKey = getDateKeyForDay(weekKey, getDayOffsetFromToday(dayName))
    const data = getDayData(dateKey)
    if (data) {
      setDayData(data)
    } else {
      // Initialize with default structure
      const defaultData = {
        dateKey,
        weekKey,
        dayName,
        type: dayName === 'tuesday' || dayName === 'thursday' || dayName === 'saturday' ? 'run' : 
              dayName === 'sunday' ? 'mobility' : 'lift',
        runType: dayName === 'tuesday' ? 'speed' : dayName === 'thursday' ? 'easy' : dayName === 'saturday' ? 'long' : null,
        completed: false,
      }
      if (dayName === 'monday' || dayName === 'wednesday' || dayName === 'friday') {
        defaultData.focus = dayName === 'monday' ? 'push' : dayName === 'wednesday' ? 'pull' : 'legs'
        defaultData.exercises = plan.exercises?.map(ex => ({
          name: ex.name,
          sets: '',
          reps: '',
          weight: '',
          rpe: '',
          completed: false,
        })) || []
      }
      setDayData(defaultData)
    }
  }

  const saveData = async () => {
    const dateKey = getDateKeyForDay(weekKey, getDayOffsetFromToday(dayName))
    await saveDayData(dateKey, dayData)
    alert('Workout saved!')
  }

  const updateField = (field, value) => {
    setDayData(prev => ({ ...prev, [field]: value }))
  }

  const updateExercise = (index, field, value) => {
    setDayData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      ),
    }))
  }

  const toggleExerciseCompleted = (index) => {
    setDayData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, completed: !ex.completed } : ex
      ),
    }))
  }

  if (!plan || !dayData) return <div>Loading...</div>

    const dateKey = getDateKeyForDay(weekKey, dayIndex)
    const date = parseLocalDate(dateKey)

  return (
    <div className="day-page">
      <div className="day-header">
        <h1>
          {dayName.charAt(0).toUpperCase() + dayName.slice(1)} – {plan.name}
          {plan.focus && ` (${plan.focus})`}
        </h1>
        <div className="day-date">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>

      <div className="planned-section">
        <h2>Planned Workout</h2>
        <div className="planned-content">
          <p><strong>Focus:</strong> {plan.focus}</p>
          <p><strong>Duration:</strong> {plan.duration}</p>
          {plan.exercises && (
            <div className="planned-exercises">
              <h3>Exercises:</h3>
              <ul>
                {plan.exercises.map((ex, i) => (
                  <li key={i}>
                    <strong>{ex.name}</strong> – {ex.sets} sets × {ex.reps} reps
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plan.workoutOptions && (
            <div className="planned-options">
              <h3>Workout Options:</h3>
              <ul>
                {plan.workoutOptions.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="actual-section">
        <h2>Actual Workout</h2>
        
        {(dayName === 'monday' || dayName === 'wednesday' || dayName === 'friday') && (
          <div className="strength-form">
            <table className="exercise-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th>Weight (kg)</th>
                  <th>RPE</th>
                  <th>Done</th>
                </tr>
              </thead>
              <tbody>
                {dayData.exercises?.map((ex, i) => (
                  <tr key={i}>
                    <td>{ex.name}</td>
                    <td>
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => updateExercise(i, 'sets', e.target.value)}
                        placeholder={plan.exercises[i]?.sets}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={ex.reps}
                        onChange={(e) => updateExercise(i, 'reps', e.target.value)}
                        placeholder={plan.exercises[i]?.reps}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={ex.weight}
                        onChange={(e) => updateExercise(i, 'weight', e.target.value)}
                        placeholder="kg"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={ex.rpe}
                        onChange={(e) => updateExercise(i, 'rpe', e.target.value)}
                        placeholder="1-10"
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={ex.completed}
                        onChange={() => toggleExerciseCompleted(i)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="session-info">
              <div className="form-group">
                <label>Start Time:</label>
                <input
                  type="time"
                  value={dayData.startTime || ''}
                  onChange={(e) => updateField('startTime', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Time:</label>
                <input
                  type="time"
                  value={dayData.endTime || ''}
                  onChange={(e) => updateField('endTime', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Session RPE (1-10):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={dayData.sessionRPE || ''}
                  onChange={(e) => updateField('sessionRPE', e.target.value)}
                />
              </div>
              {dayName === 'wednesday' && (
                <div className="form-group">
                  <label>Posture/Upper Back Feel (1-10):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={dayData.postureRating || ''}
                    onChange={(e) => updateField('postureRating', e.target.value)}
                  />
                </div>
              )}
              <div className="form-group full-width">
                <label>Notes:</label>
                <textarea
                  value={dayData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows="3"
                  placeholder="Add any notes about your workout..."
                />
              </div>
            </div>
          </div>
        )}

        {dayName === 'tuesday' && (
          <div className="run-form">
            <div className="form-group">
              <label>Workout Type:</label>
              <select
                value={dayData.selectedWorkout || ''}
                onChange={(e) => updateField('selectedWorkout', e.target.value)}
              >
                <option value="">Select workout...</option>
                {plan.workoutOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Total Time (minutes):</label>
                <input
                  type="number"
                  value={dayData.totalTime || ''}
                  onChange={(e) => updateField('totalTime', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Total Distance (km):</label>
                <input
                  type="number"
                  step="0.1"
                  value={dayData.totalDistance || ''}
                  onChange={(e) => updateField('totalDistance', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Average Pace (min/km):</label>
                <input
                  type="number"
                  step="0.1"
                  value={dayData.averagePace || ''}
                  onChange={(e) => updateField('averagePace', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Average HR (bpm):</label>
                <input
                  type="number"
                  value={dayData.averageHR || ''}
                  onChange={(e) => updateField('averageHR', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Best Interval Pace (min/km):</label>
              <input
                type="number"
                step="0.1"
                value={dayData.bestIntervalPace || ''}
                onChange={(e) => updateField('bestIntervalPace', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Surface:</label>
                <input
                  type="text"
                  value={dayData.surface || ''}
                  onChange={(e) => updateField('surface', e.target.value)}
                  placeholder="Track, Road, Trail..."
                />
              </div>
              <div className="form-group">
                <label>Shoes:</label>
                <input
                  type="text"
                  value={dayData.shoes || ''}
                  onChange={(e) => updateField('shoes', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Notes:</label>
              <textarea
                value={dayData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows="3"
              />
            </div>
          </div>
        )}

        {dayName === 'thursday' && (
          <div className="run-form">
            <div className="form-group">
              <label>Total Time (minutes):</label>
              <input
                type="number"
                value={dayData.totalTime || ''}
                onChange={(e) => updateField('totalTime', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Total Distance (km):</label>
              <input
                type="number"
                step="0.1"
                value={dayData.totalDistance || ''}
                onChange={(e) => updateField('totalDistance', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Average Pace (min/km):</label>
                <input
                  type="number"
                  step="0.1"
                  value={dayData.averagePace || ''}
                  onChange={(e) => updateField('averagePace', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Average HR (bpm):</label>
                <input
                  type="number"
                  value={dayData.averageHR || ''}
                  onChange={(e) => updateField('averageHR', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Pace Difference vs Last Speed Session:</label>
              <input
                type="text"
                value={dayData.paceDifference || ''}
                onChange={(e) => updateField('paceDifference', e.target.value)}
                placeholder="e.g., +0:30 min/km slower"
              />
            </div>
            <div className="form-group">
              <label>Perceived Effort (should feel easy):</label>
              <select
                value={dayData.perceivedEffort || ''}
                onChange={(e) => updateField('perceivedEffort', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="very-easy">Very Easy</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard (too hard!)</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Notes:</label>
              <textarea
                value={dayData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows="3"
              />
            </div>
          </div>
        )}

        {dayName === 'friday' && (
          <div className="strength-form">
            <table className="exercise-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th>Weight (kg)</th>
                  <th>RPE</th>
                  <th>Done</th>
                </tr>
              </thead>
              <tbody>
                {dayData.exercises?.map((ex, i) => (
                  <tr key={i}>
                    <td>{ex.name}</td>
                    <td>
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => updateExercise(i, 'sets', e.target.value)}
                        placeholder={plan.exercises[i]?.sets}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={ex.reps}
                        onChange={(e) => updateExercise(i, 'reps', e.target.value)}
                        placeholder={plan.exercises[i]?.reps}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={ex.weight}
                        onChange={(e) => updateExercise(i, 'weight', e.target.value)}
                        placeholder="kg"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={ex.rpe}
                        onChange={(e) => updateExercise(i, 'rpe', e.target.value)}
                        placeholder="1-10"
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={ex.completed}
                        onChange={() => toggleExerciseCompleted(i)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="session-info">
              <div className="form-group">
                <label>Start Time:</label>
                <input
                  type="time"
                  value={dayData.startTime || ''}
                  onChange={(e) => updateField('startTime', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Time:</label>
                <input
                  type="time"
                  value={dayData.endTime || ''}
                  onChange={(e) => updateField('endTime', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Session RPE (1-10):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={dayData.sessionRPE || ''}
                  onChange={(e) => updateField('sessionRPE', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={dayData.sorenessNextDay || false}
                    onChange={(e) => updateField('sorenessNextDay', e.target.checked)}
                  />
                  Soreness Next Day (check on Saturday)
                </label>
              </div>
              <div className="form-group full-width">
                <label>Notes:</label>
                <textarea
                  value={dayData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows="3"
                />
              </div>
            </div>
          </div>
        )}

        {dayName === 'saturday' && (
          <div className="run-form">
            <div className="form-group">
              <label>Total Time (minutes):</label>
              <input
                type="number"
                value={dayData.totalTime || ''}
                onChange={(e) => updateField('totalTime', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Total Distance (km):</label>
              <input
                type="number"
                step="0.1"
                value={dayData.totalDistance || ''}
                onChange={(e) => updateField('totalDistance', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Average Pace (min/km):</label>
                <input
                  type="number"
                  step="0.1"
                  value={dayData.averagePace || ''}
                  onChange={(e) => updateField('averagePace', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Average HR (bpm):</label>
                <input
                  type="number"
                  value={dayData.averageHR || ''}
                  onChange={(e) => updateField('averageHR', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Fuel Used - Carbs per Hour (g):</label>
                <input
                  type="number"
                  value={dayData.carbsPerHour || ''}
                  onChange={(e) => updateField('carbsPerHour', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Fluids (L):</label>
                <input
                  type="number"
                  step="0.1"
                  value={dayData.fluids || ''}
                  onChange={(e) => updateField('fluids', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Route:</label>
              <input
                type="text"
                value={dayData.route || ''}
                onChange={(e) => updateField('route', e.target.value)}
                placeholder="Describe your route..."
              />
            </div>
            <div className="form-group">
              <label>Mental Toughness Rating (1-10):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={dayData.mentalToughness || ''}
                onChange={(e) => updateField('mentalToughness', e.target.value)}
              />
            </div>
            <div className="form-group full-width">
              <label>Notes:</label>
              <textarea
                value={dayData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows="3"
              />
            </div>
          </div>
        )}

        {dayName === 'sunday' && (
          <div className="mobility-form">
            <div className="form-group">
              <label>
                <input
                  type="radio"
                  name="sundayType"
                  checked={dayData.completelyOff || false}
                  onChange={(e) => {
                    updateField('completelyOff', true)
                    updateField('mobilityDone', false)
                  }}
                />
                Completely Off
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="radio"
                  name="sundayType"
                  checked={dayData.mobilityDone || false}
                  onChange={(e) => {
                    updateField('mobilityDone', true)
                    updateField('completelyOff', false)
                  }}
                />
                Mobility Session
              </label>
            </div>
            {dayData.mobilityDone && (
              <>
                <div className="form-group">
                  <label>Duration (minutes):</label>
                  <input
                    type="number"
                    value={dayData.mobilityDuration || ''}
                    onChange={(e) => updateField('mobilityDuration', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Exercises Done:</label>
                  <div className="mobility-exercises">
                    {plan.mobilityExercises?.map((ex, i) => (
                      <label key={i}>
                        <input
                          type="checkbox"
                          checked={dayData.mobilityExercisesDone?.includes(ex) || false}
                          onChange={(e) => {
                            const current = dayData.mobilityExercisesDone || []
                            if (e.target.checked) {
                              updateField('mobilityExercisesDone', [...current, ex])
                            } else {
                              updateField('mobilityExercisesDone', current.filter(x => x !== ex))
                            }
                          }}
                        />
                        {ex}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Recovery Rating (1-10):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={dayData.recoveryRating || ''}
                    onChange={(e) => updateField('recoveryRating', e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="form-group full-width">
              <label>Notes:</label>
              <textarea
                value={dayData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows="3"
              />
            </div>
          </div>
        )}

        <div className="save-section">
          <label>
            <input
              type="checkbox"
              checked={dayData.completed || false}
              onChange={(e) => updateField('completed', e.target.checked)}
            />
            Mark as Completed
          </label>
          <button onClick={saveData} className="save-button">
            Save Workout
          </button>
        </div>
      </div>
    </div>
  )
}

export default DayPage

