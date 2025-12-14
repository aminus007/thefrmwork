-- Supabase Database Schema for Hybrid Workout Tracker
-- Run this SQL in your Supabase SQL Editor

-- Create the workout_data table
CREATE TABLE IF NOT EXISTS workout_data (
  device_id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on updated_at for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_data_updated_at ON workout_data(updated_at);

-- Enable Row Level Security (RLS)
ALTER TABLE workout_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read/write (since we're using device_id, not user auth)
-- This allows any device to read/write its own data
CREATE POLICY "Allow anonymous access to own device data"
  ON workout_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create a function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_workout_data_updated_at
  BEFORE UPDATE ON workout_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

