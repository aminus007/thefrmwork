# Hybrid Workout Tracker

A web application to track your "3 runs + 3 lifts + 1 recovery" hybrid week. This app helps you monitor your training across running and strength training with detailed daily tracking and weekly summaries.

## Features

- **7-Day Fixed Layout**: Monday (Upper Push), Tuesday (Speed Run), Wednesday (Upper Pull), Thursday (Easy Run), Friday (Lower Body), Saturday (Long Run), Sunday (Off/Mobility)
- **Daily Tracking Pages**: Each day has pre-filled workout plans and editable actual workout forms
- **Dashboard**: Weekly calendar view with completion status and key metrics
- **Cloud Sync**: Optional Supabase integration for syncing across devices (no login required)
- **Data Persistence**: All data stored locally in your browser (localStorage) with optional cloud backup
- **Export/Import**: Backup and restore your workout data
- **Mobile-Friendly**: Responsive design optimized for mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- (Optional) Supabase account for cloud sync

### Installation

1. Navigate to the project directory:
```bash
cd hybrid-workout-tracker
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up Supabase for cloud sync:
   - Create a new project at [Supabase](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key to `.env`

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Dashboard**: View your weekly calendar and metrics
2. **Daily Pages**: Click on any day to log your workout
3. **Settings**: Export/import your data or clear all data

## Data Structure

Workout data is stored in browser localStorage with the following structure:
- Each day is keyed by date (YYYY-MM-DD)
- Workouts include type (run/lift/mobility), exercises, metrics, and notes
- Weekly summaries are calculated from daily entries

### Cloud Sync (Optional)

If Supabase is configured:
- Data is automatically synced to the cloud on save
- Each device gets a unique device ID (stored in localStorage)
- Data syncs across devices with the same device ID
- No login required - completely anonymous

## Tech Stack

- **React 18**: UI framework
- **React Router**: Navigation
- **Vite**: Build tool and dev server
- **LocalStorage**: Primary data persistence
- **Supabase**: Optional cloud sync (no login required)

## License

MIT

