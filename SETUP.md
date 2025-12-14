# Supabase Setup Guide

This guide will help you set up Supabase cloud sync for the Hybrid Workout Tracker.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `hybrid-workout-tracker` (or any name you prefer)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose the closest region to you
5. Click "Create new project"
6. Wait for the project to be created (takes ~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Step 3: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API** (left sidebar)
2. You'll see:
   - **Project URL**: Copy this value
   - **anon public** key: Copy this value (under "Project API keys")

## Step 4: Configure the App

1. In the `hybrid-workout-tracker` directory, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Replace the placeholder values with your actual Supabase URL and anon key

## Step 5: Restart the Dev Server

If your dev server is running, restart it:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Step 6: Verify Sync is Working

1. Open the app in your browser
2. You should see a "Last synced" indicator at the top (if Supabase is configured)
3. Go to Settings → you should see a "Cloud Sync" section
4. Log a workout and check if it syncs

## How It Works

- **No Login Required**: Each device gets a unique device ID stored in localStorage
- **Automatic Sync**: Data syncs to Supabase automatically when you save workouts
- **Device-Specific**: Each device has its own data (identified by device ID)
- **Offline-First**: App works offline, syncs when online

## Troubleshooting

### Sync Status Not Showing
- Check that your `.env` file exists and has the correct values
- Make sure you restarted the dev server after adding `.env`
- Check browser console for any errors

### Sync Failing
- Verify your Supabase URL and anon key are correct
- Check that you ran the SQL schema in Supabase
- Check browser console for error messages
- Verify your Supabase project is active (not paused)

### Data Not Syncing
- Check your internet connection
- Look for errors in the browser console
- Try manual sync from Settings page
- Verify the `workout_data` table exists in Supabase (Table Editor)

## Security Note

The anon key is safe to use in client-side code. Supabase Row Level Security (RLS) policies ensure that:
- Each device can only access its own data (via device_id)
- The policy allows anonymous access but is scoped to device_id

For production, consider:
- Adding rate limiting
- Implementing user authentication if you want multi-user support
- Using service role key only on server-side (never expose it in client code)

