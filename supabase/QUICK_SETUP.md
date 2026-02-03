# Quick Setup Guide - Order Notifications

## Your Resend API Key

⚠️ **Your API key has been provided separately. Use it in the steps below.**

**API Key:** `re_RqFMUNJm_MgWRCcbFiNvro8NzvDMYvx9d`

⚠️ **Keep this key secure and never commit it to Git!**

## Option 1: Using Supabase Dashboard (Easiest)

1. **Go to your Supabase Dashboard:**

   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to Edge Functions:**

   - Click on **Edge Functions** in the left sidebar
   - Find or create the function `send-order-notification`

3. **Set the Secret:**

   - Click on the function name
   - Go to **Settings** tab
   - Scroll to **Secrets** section
   - Click **Add Secret**
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_RqFMUNJm_MgWRCcbFiNvro8NzvDMYvx9d` (your API key)
   - Click **Save**

4. **Deploy the Function:**
   - Go to the **Code** tab
   - Copy the code from `supabase/functions/send-order-notification/index.ts`
   - Paste it into the editor
   - Click **Deploy**

## Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project ref from Supabase dashboard URL)
supabase link --project-ref your-project-ref

# Set the Resend API key secret (replace with your actual key)
supabase secrets set RESEND_API_KEY=re_RqFMUNJm_MgWRCcbFiNvro8NzvDMYvx9d

# Deploy the function
supabase functions deploy send-order-notification
```

## Verify Setup

1. **Check Secret is Set:**

   - In Dashboard: Go to Edge Functions → Settings → Secrets
   - Should see `RESEND_API_KEY` listed

2. **Test the Function:**
   - Place a test order on your site
   - Check your email inbox (and spam folder)
   - Check function logs in Supabase Dashboard

## Important Notes

- ⚠️ **Never commit API keys to Git** - This file should be in `.gitignore`
- ✅ The API key is now set as a secret in Supabase (secure)
- 📧 Make sure your admin email is set in the `profiles` table with `is_admin = true`
- 🔍 Check function logs if emails aren't sending

## Next Steps

1. Verify your domain in Resend.com (or use test domain for now)
2. Update the "from" email address in the function code if needed
3. Test with a real order

For detailed instructions, see `NOTIFICATION_SETUP.md`
