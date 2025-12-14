# Setup

This project uses Supabase for cloud sync. The sections below walk through prerequisites, local development, Supabase configuration, and troubleshooting.

## Prerequisites
- Node 18+ (or compatible LTS)
- npm (or yarn/pnpm)

## Local development
1. Install dependencies:

```bash
npm install
```

2. Create environment file (there is no committed .env):

Create a `.env` in the repo root with these keys:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Run the dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
npm run preview
```

## Supabase setup
1. Create a project at https://supabase.com (choose a name, strong DB password, and region).
2. In the Supabase dashboard open **SQL Editor**, create a new query and paste the contents of `supabase-schema.sql`, then run it to create the required tables.
3. In **Settings → API** copy the **Project URL** and the **anon/public** key. Add them to your local `.env` as shown above.

## Verify sync
1. Start the app and open it in the browser.
2. In Settings you should see the Cloud Sync section and a "Last synced" indicator after performing an operation.

## Troubleshooting
- If the app can't connect to Supabase, check your `.env` values and restart the dev server.
- Inspect the browser console for errors and any network requests to your Supabase URL.
- Confirm you ran `supabase-schema.sql` and the `workout_data` table exists in the Table Editor.

## Notes and security
- The anon key is intended for client-side use; do not commit service_role keys to the client.
- For production consider adding authentication and server-side operations for sensitive tasks.

If you want, I can add a `.env.example` and a short script to generate a `.env` from prompts. Reply with "yes" to add those changes.

