# Setting Up Home Settings Table in Supabase

This guide explains how to create the `home_settings` table in your Supabase project to manage the homepage header content.

## Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**

   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the Migration SQL**

   - Click **New Query**
   - Copy and paste the contents of `supabase/migrations/create_home_settings.sql`
   - Click **Run** (or press `Ctrl/Cmd + Enter`)

3. **Verify Table Creation**
   - Go to **Table Editor** in the left sidebar
   - You should see `home_settings` table listed
   - Click on it to view the structure

## Method 2: Using Supabase CLI (If you have it set up)

If you have Supabase CLI installed and linked to your project:

```bash
# Navigate to your project root
cd /path/to/aurora-main

# Run the migration
supabase db push
```

Or manually:

```bash
supabase db execute -f supabase/migrations/create_home_settings.sql
```

## Table Structure

The `home_settings` table contains:

- `id` (UUID) - Primary key
- `left_title` (TEXT) - Main title for left hero panel
- `left_subtitle` (TEXT) - Subtitle for left hero panel
- `left_image` (TEXT) - URL/path to left hero image
- `right_image` (TEXT) - URL/path to right hero image
- `cta_text` (TEXT) - Button text for right panel
- `cta_link` (TEXT) - Link destination for button
- `created_at` (TIMESTAMP) - Auto-generated creation timestamp
- `updated_at` (TIMESTAMP) - Auto-updated modification timestamp

## Security Policies

The table has Row Level Security (RLS) enabled with:

- **Public Read Access**: Anyone can read the settings (needed for homepage display)
- **Admin Write Access**: Only authenticated users with `is_admin = true` in their profile can insert/update

## Initial Setup

After creating the table, you can either:

1. **Let the admin panel create the first row** - Just go to `/admin/home` and save settings
2. **Manually insert a default row** - Uncomment the INSERT statement at the bottom of the SQL file

## Troubleshooting

### Error: "relation already exists"

- The table already exists. You can either:
  - Drop it first: `DROP TABLE IF EXISTS home_settings CASCADE;`
  - Or modify the SQL to use `CREATE TABLE IF NOT EXISTS` (already included)

### Error: "permission denied"

- Make sure you're running the SQL as a database owner/admin
- Check that RLS policies are correctly set up

### Admin can't save settings

- Verify the `profiles` table has an `is_admin` column
- Check that the admin user's profile has `is_admin = true`
- Verify RLS policies are active

## Next Steps

Once the table is created:

1. Go to `/admin/home` in your application
2. Upload images and set text content
3. Click "Save Header"
4. Check the homepage (`/`) to see your changes
