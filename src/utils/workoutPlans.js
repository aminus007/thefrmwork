// Pre-defined workout plans for each day

export const workoutPlans = {
  monday: {
    name: 'Upper Push',
    focus: 'Chest, Shoulders, Triceps',
    duration: '40-50 minutes',
    exercises: [
      { name: 'Bench/DB Press', sets: '3-4', reps: '6-8' },
      { name: 'Incline DB Press', sets: '3', reps: '8-10' },
      { name: 'Shoulder Press', sets: '3', reps: '8-10' },
      { name: 'Dips/Triceps Pushdowns', sets: '3', reps: '10-12' },
      { name: 'Lateral Raises', sets: '3', reps: '12-15' },
    ],
  },
  tuesday: {
    name: 'Speed Run',
    focus: 'Get faster, boost VO₂max',
    duration: '45-60 minutes',
    workoutOptions: [
      '6×400 m @ 5K pace (90 s rest)',
      '10×200 m fast (walk/jog recovery)',
      '20 min tempo @ "comfortably hard"',
    ],
  },
  wednesday: {
    name: 'Upper Pull',
    focus: 'Back, Biceps, Posture',
    duration: '40-50 minutes',
    exercises: [
      { name: 'Pull-ups/Lat Pulldown', sets: '3-4', reps: '6-10' },
      { name: 'Barbell/Seated Row', sets: '3', reps: '8-10' },
      { name: 'Face Pulls', sets: '3', reps: '12-15' },
      { name: 'Hammer Curls', sets: '3', reps: '10-12' },
      { name: 'Reverse Fly', sets: '3', reps: '12-15' },
    ],
  },
  thursday: {
    name: 'Easy Run',
    focus: 'Build engine in Zone 2',
    duration: '30-50 minutes',
    intensity: 'Easy/low intensity pace',
  },
  friday: {
    name: 'Lower Body',
    focus: 'Strong legs without ruining long run',
    duration: '40-50 minutes',
    exercises: [
      { name: 'Squat/Leg Press', sets: '3-4', reps: '6-8' },
      { name: 'Romanian Deadlift', sets: '3', reps: '8-10' },
      { name: 'Bulgarian Split Squat', sets: '3', reps: '8-10 each' },
      { name: 'Leg Curls', sets: '3', reps: '10-12' },
      { name: 'Calf Raises', sets: '3', reps: '12-15' },
    ],
  },
  saturday: {
    name: 'Long Run',
    focus: 'Endurance, practice fueling and mental toughness',
    duration: '60-120 minutes',
  },
  sunday: {
    name: 'Off / Mobility',
    focus: 'Recovery',
    duration: 'Optional mobility session',
    mobilityExercises: [
      'Foam rolling',
      'Stretching',
      'Light yoga',
    ],
  },
};

