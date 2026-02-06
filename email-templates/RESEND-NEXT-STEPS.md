# What to do after adding the template and DNS in Resend

You’ve added the order email template and DNS in Resend. Follow these steps to start receiving order emails.

---

## If you integrated Supabase in Resend

If you connected **Supabase** in Resend ([resend.com/supabase](https://resend.com/supabase) or **Settings → Integrations → Supabase**):

- **Auth emails** (password reset, magic link, etc.) can use Resend via **Custom SMTP** in Supabase: **Project Settings → Authentication → SMTP** with Resend’s SMTP (host: `smtp.resend.com`, port: 465, username: `resend`, password: your API key).
- **Order notification emails** (admin + customer) are sent by the **Edge Function** `send-order-notification`, which calls Resend’s **API** (not SMTP). So you still need:
  1. A **Resend API key** (same key can be used for both SMTP and API).
  2. The **`RESEND_API_KEY`** secret set in Supabase for the Edge Function (see step 2 below).
  3. The function code deployed and “From” address set (steps 3–4).

The Resend–Supabase integration and the order notification function work together: the integration helps with Auth emails and project linking; the function handles order emails.

---

## 1. Get your Resend API key

1. Log in at [resend.com](https://resend.com).
2. Go to **API Keys** (in the sidebar or **Settings**).
3. Click **Create API Key**, name it (e.g. “Aurora production”), then **Add**.
4. Copy the key (it starts with `re_`). You won’t see it again.

---

## 2. Set the API key in Supabase

The order notification is sent by the Supabase Edge Function `send-order-notification`, which needs your Resend API key as a secret.

**Option A – Supabase Dashboard**

1. Open your [Supabase project](https://supabase.com/dashboard) → **Edge Functions**.
2. Open **send-order-notification** → **Settings** (or **Secrets**).
3. Add a secret:
   - **Name:** `RESEND_API_KEY`
   - **Value:** your Resend API key (e.g. `re_...`).

**Option B – Supabase CLI**

```bash
supabase secrets set RESEND_API_KEY=re_your_actual_key_here
```

Then redeploy the function so it picks up the secret:

```bash
supabase functions deploy send-order-notification
```

---

## 3. Use your verified domain as “From”

After your domain is verified in Resend (DNS green), the function must send **from** that domain.

1. Open `supabase/functions/send-order-notification/index.ts`.
2. Find the line that looks like:

   ```ts
   from: 'Aurora Shop <orders@aurora.ge>',
   ```

3. Change it to your **verified** domain and address in Resend, for example:

   ```ts
   from: 'Aurora Shop <orders@yourdomain.com>',
   ```

   Use the exact “From” address you configured in Resend for that domain.

4. Redeploy the function:

   ```bash
   supabase functions deploy send-order-notification
   ```

**If the domain is not verified yet:** you can test with Resend’s test domain (only for testing):

```ts
from: 'Aurora Shop <onboarding@resend.dev>',
```

---

## 4. (Optional) Use the project’s HTML template in the function

Right now the Edge Function builds its own HTML. If you want it to use the same layout as `email-templates/order-notification.html`:

- You can copy the HTML from `order-notification.html` into the function and replace placeholders (`{{ORDER_NUMBER}}`, `{{ORDER_DATE}}`, `{{ITEMS_TABLE_BODY}}`, etc.) with the same logic the function already uses for `orderId`, `orderDate`, `itemsList`, etc.
- Or keep the current inline HTML in the function; it already sends order details. The file in `email-templates/` is then mainly for reference or for use in Resend’s UI.

No code change is required for basic “order email to admin” to work; the function already sends a full order summary.

---

## 5. Ensure an admin email exists

The function sends the “new order” email to every profile with `is_admin = true`. At least one must exist.

In Supabase: **SQL Editor** → run:

```sql
SELECT id, email, is_admin FROM profiles WHERE is_admin = true;
```

If the list is empty, set an admin (replace with your real user id and email):

```sql
UPDATE profiles
SET is_admin = true, email = 'your-admin@example.com'
WHERE id = 'your-user-uuid';
```

Use the same email you want to receive order notifications.

---

## 6. Test an order

1. In your app: add a product to the cart and complete checkout (use a real or test address).
2. Check the inbox of your admin email (and spam).
3. If nothing arrives:
   - **Supabase:** **Edge Functions** → **send-order-notification** → **Logs** (look for errors).
   - **Resend:** **Emails** (or **Logs**) to see if the email was accepted and delivered.

---

## 7. (Optional) Set storefront URL for email links

So “View in admin” and “View your orders” in emails point to your real site, set an optional secret in Supabase: **Name** `FRONTEND_URL`, **Value** your storefront URL (e.g. `https://aurora.ge`). If not set, those links are omitted.

---

## 8. Checklist

- [ ] Resend API key created and copied.
- [ ] `RESEND_API_KEY` set in Supabase (Dashboard or CLI).
- [ ] “From” address in `send-order-notification/index.ts` updated to your verified domain (or `onboarding@resend.dev` for testing).
- [ ] Edge function deployed after changing secrets/code.
- [ ] At least one admin in `profiles` with `is_admin = true` and correct `email`.
- [ ] Test order placed; **admin** and **customer** both receive emails (inbox or spam).

---

## If sending is not working

1. **Check Edge Function logs**  
   Supabase Dashboard → **Edge Functions** → **send-order-notification** → **Logs**. You should see lines like:
   - `[Notification] type=new_order orderId=... hasCustomerEmail=true`
   - `[Admin] Sending to: ...`
   - `[Resend] Sent successfully, id: ...`
   - `[Customer] Sending confirmation to: ...`

   If you see `[Resend] Error response: ...`, the message usually says why (e.g. domain not verified, invalid from address).

2. **Use Resend’s test “from” address**  
   Until your domain is verified, you can send from Resend’s test address. In Supabase **Secrets**, add:
   - **Name:** `FROM_EMAIL`
   - **Value:** `Aurora Shop <onboarding@resend.dev>`

   Then redeploy the function. After your domain is verified, remove `FROM_EMAIL` or set it to e.g. `Aurora Shop <orders@aurora.ge>`.

3. **Admin vs customer**  
   The function sends **two** emails for each new order:
   - **Admin:** to all users in `profiles` with `is_admin = true` (or fallback email if none).
   - **Customer:** to the order’s `customer_email` (order confirmation).

   The response body includes `adminSent` and `customerSent` so you can see which went through. Check logs to see if the customer email was skipped (e.g. missing or invalid email).

4. **Optional secret for “from” address**  
   You can set **`FROM_EMAIL`** in Supabase Secrets instead of editing code (e.g. `Aurora Shop <orders@yourdomain.com>`). The function uses it when present.

   **Logo in emails:** Set **`LOGO_URL`** in Supabase Edge Function secrets to a full URL of your logo image (e.g. `https://aurora.ge/logo.png`). The logo appears in the header of admin, customer, and status-update emails. Use a direct image URL (HTTPS); size around 140×48px or similar works well.

5. **Resend shows a request with empty `to` / `subject` / `html`**  
   If in Resend you see **POST /emails** with `"to": [""]`, `"subject": ""`, `"html": ""`, that request is usually from **Supabase Auth** (signup, magic link, password reset), not from the order notification function. Fix it in **Supabase → Authentication → Email Templates** (set a valid To and non-empty subject/body). The order function never sends with empty to/subject/html.

---

## More detail and troubleshooting

For full setup (including Supabase URL/service role for loading admins), testing with curl, and troubleshooting, see:

**[supabase/NOTIFICATION_SETUP.md](../supabase/NOTIFICATION_SETUP.md)**

For how the HTML template placeholders work and how to wire them in code, see:

**[email-templates/README.md](./README.md)**
