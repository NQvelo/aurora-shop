# Order Notification System Setup Guide

This guide will help you set up the email notification system for new orders in your Aurora Shop application. When a customer places an order, admins will receive a detailed email notification.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Customization](#customization)

---

## Overview

The notification system uses:

- **Supabase Edge Functions** - Serverless function that handles email sending
- **Resend.com** - Email delivery service (recommended) or SMTP
- **PostgreSQL** - Stores order data and admin profiles

When a customer completes checkout:

1. Order is saved to the `orders` table
2. Edge function `send-order-notification` is triggered
3. Function fetches admin email(s) from `profiles` table
4. Beautiful HTML email is sent to admin(s) with order details

---

## Prerequisites

Before starting, ensure you have:

- ✅ Supabase project set up
- ✅ `orders` table created in your database
- ✅ `profiles` table with `is_admin` field
- ✅ Resend.com account (free tier available) OR SMTP credentials
- ✅ Supabase CLI installed (`npm install -g supabase`)

---

## Step-by-Step Setup

### Step 1: Create Resend.com Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address
4. Go to **API Keys** section and create a new API key
5. Copy the API key (starts with `re_...`)

**Important:** You'll need to verify a domain to send emails. For testing, Resend provides a test domain, but for production you should:

- Add your domain (e.g., `aurora.ge`)
- Add DNS records (SPF, DKIM, DMARC)
- Wait for verification (usually 5-10 minutes)

### Step 2: Deploy Edge Function

The edge function is already created in `supabase/functions/send-order-notification/`. To deploy it:

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Create a new function**
3. Name it: `send-order-notification`
4. Copy the contents from `supabase/functions/send-order-notification/index.ts`
5. Paste into the function editor
6. Click **Deploy**

#### Option B: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-order-notification
```

### Step 3: Set Environment Variables

You need to set the `RESEND_API_KEY` as a secret in Supabase:

#### Using Supabase Dashboard:

1. Go to **Edge Functions** → **send-order-notification**
2. Click on **Settings** or **Secrets**
3. Add secret:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key (e.g., `re_abc123...`)

#### Using Supabase CLI:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

**Optional:** If you want to use admin emails from the database (recommended), also set:

```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

To find your service role key:

1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy the **service_role** key (⚠️ Keep this secret!)

### Step 4: Verify Admin Email in Database

The function will automatically fetch admin emails from the `profiles` table. Ensure:

1. Your admin user exists in the `profiles` table
2. The `is_admin` field is set to `true` for admin users
3. The `email` field contains a valid email address

**SQL Query to check:**

```sql
SELECT id, email, is_admin
FROM profiles
WHERE is_admin = true;
```

**SQL Query to set admin email (if needed):**

```sql
-- Update existing user to admin
UPDATE profiles
SET is_admin = true, email = 'your-admin@email.com'
WHERE id = 'user-uuid-here';

-- Or create admin profile
INSERT INTO profiles (id, email, is_admin)
VALUES ('user-uuid-here', 'your-admin@email.com', true);
```

### Step 5: Update Email "From" Address

In `supabase/functions/send-order-notification/index.ts`, find this line:

```typescript
from: 'Aurora Shop <orders@aurora.ge>',
```

Replace `aurora.ge` with your verified domain in Resend, or use Resend's test domain for development:

```typescript
from: 'Aurora Shop <onboarding@resend.dev>', // For testing only
```

---

## Configuration

### Email Recipients

The function supports multiple admin emails:

1. **Automatic (Recommended):** Fetches all emails from `profiles` where `is_admin = true`
2. **Fallback:** If no admin emails found, uses `teklaqvelidze@gmail.com`

To change the fallback email, edit line 28 in `index.ts`:

```typescript
const adminEmails = adminProfiles?.map((p) => p.email).filter(Boolean) || [
  "your-email@gmail.com",
];
```

### Email Template Customization

The HTML email template is in the `html` variable. You can customize:

- Colors (currently purple gradient: `#667eea`, `#764ba2`)
- Logo/branding
- Additional order information
- Styling and layout

Edit the `html` string in the `type === 'new_order'` section.

### Notification Types

The function handles two notification types:

1. **`new_order`** - Sent to admin when order is placed
2. **`status_update`** - Sent to customer when order status changes

---

## Testing

### Test Order Notification

1. **Create a test order:**

   - Go to your shop
   - Add items to cart
   - Complete checkout with test data

2. **Check function logs:**

   ```bash
   supabase functions logs send-order-notification
   ```

3. **Check your email inbox** (including spam folder)

### Test Edge Function Directly

You can test the function using curl:

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/send-order-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "new_order",
    "orderData": {
      "id": "test-order-123",
      "customer_name": "Test Customer",
      "customer_email": "test@example.com",
      "customer_phone": "+995123456789",
      "shipping_address": "123 Test St, Tbilisi",
      "total_amount": 150.00,
      "created_at": "2024-01-01T12:00:00Z",
      "items": [
        {
          "name": "Test Product",
          "size": "M",
          "quantity": 2,
          "price": 75.00
        }
      ]
    }
  }'
```

---

## Troubleshooting

### Emails Not Sending

1. **Check Resend API Key:**

   ```bash
   supabase secrets list
   ```

   Ensure `RESEND_API_KEY` is set correctly.

2. **Check Function Logs:**

   ```bash
   supabase functions logs send-order-notification --tail
   ```

   Look for error messages.

3. **Verify Domain in Resend:**

   - Go to Resend Dashboard → **Domains**
   - Ensure domain is verified (green checkmark)
   - For testing, use `onboarding@resend.dev`

4. **Check Admin Email:**
   ```sql
   SELECT email, is_admin FROM profiles WHERE is_admin = true;
   ```
   Ensure admin email exists and is valid.

### Common Errors

**Error: `RESEND_API_KEY is not set`**

- Solution: Set the secret using `supabase secrets set RESEND_API_KEY=...`

**Error: `Resend error: Domain not verified`**

- Solution: Verify your domain in Resend or use test domain for development

**Error: `Invalid notification type`**

- Solution: Ensure `type` is either `"new_order"` or `"status_update"`

**Emails Going to Spam:**

- Solution: Verify domain with SPF, DKIM, DMARC records in Resend
- Use a professional "from" address
- Avoid spam trigger words in subject line

### Function Not Triggering

1. **Check CheckoutPage.tsx:**
   Ensure this code exists after order creation:

   ```typescript
   supabase.functions
     .invoke("send-order-notification", {
       body: {
         type: "new_order",
         orderData: orderData,
       },
     })
     .catch((err) => console.error("Error triggering notification:", err));
   ```

2. **Check Browser Console:**
   Look for errors when completing checkout

3. **Check Network Tab:**
   Verify the function is being called (check for `send-order-notification` request)

---

## Customization

### Add More Admin Emails

The function automatically sends to all admins. To add more admins:

```sql
UPDATE profiles
SET is_admin = true, email = 'new-admin@email.com'
WHERE id = 'user-uuid';
```

### Change Email Subject

Edit line 45 in `index.ts`:

```typescript
subject = `🛍️ New Order #${orderId} - ₾${orderData.total_amount.toFixed(2)}`;
```

### Add SMS Notifications

You can extend the function to send SMS using Twilio or similar:

```typescript
// Add after email sending
const twilioResponse = await fetch("https://api.twilio.com/...", {
  method: "POST",
  // ... SMS configuration
});
```

### Add Slack/Discord Notifications

```typescript
// Add webhook notification
await fetch("YOUR_SLACK_WEBHOOK_URL", {
  method: "POST",
  body: JSON.stringify({
    text: `New order #${orderId} - ${orderData.customer_name} - ₾${orderData.total_amount}`,
  }),
});
```

---

## Security Best Practices

1. **Never commit secrets to Git:**

   - Use Supabase secrets for API keys
   - Add `.env` to `.gitignore`

2. **Use Service Role Key Carefully:**

   - Only use in server-side code (Edge Functions)
   - Never expose in client-side code

3. **Validate Input:**

   - The function validates `type` and required fields
   - Consider adding more validation if needed

4. **Rate Limiting:**
   - Resend has rate limits (100/day free tier)
   - Consider caching or queuing for high-volume shops

---

## Production Checklist

Before going live:

- [ ] Domain verified in Resend
- [ ] DNS records (SPF, DKIM, DMARC) configured
- [ ] Admin email(s) set in `profiles` table
- [ ] `RESEND_API_KEY` secret set in Supabase
- [ ] Edge function deployed and tested
- [ ] Test order sent successfully
- [ ] Email template customized with your branding
- [ ] "From" address updated to your domain
- [ ] Error handling tested
- [ ] Function logs monitored

---

## Support

If you encounter issues:

1. Check Supabase Edge Function logs
2. Check Resend dashboard for delivery status
3. Review browser console for client-side errors
4. Verify all environment variables are set correctly

---

## Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Resend.com Documentation](https://resend.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

**Last Updated:** January 2025

**Version:** 1.0.0
