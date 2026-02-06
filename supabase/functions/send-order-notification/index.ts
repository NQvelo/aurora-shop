import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_PROJECT_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
// Optional: your storefront URL for "View in admin" / "View your orders" links (e.g. https://aurora.ge)
const baseUrl = Deno.env.get('FRONTEND_URL') || ''
// From address. Use your verified domain in Resend (e.g. Aurora Shop <orders@aurora.ge>). For testing use: onboarding@resend.dev
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Aurora by Tekla <noreply@aurora.com.ge>'
// Admin notification email when no admin in profiles or as fallback. Override with ADMIN_EMAIL env if needed.
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'teklaqvelidze@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Luxury Design Colors
// Primary (Black): #141414
// Accent (Gold): #D9A91A
// Background (Light): #FFFFFF / #F9F9F9

function escapeHtml(s: string): string {
  if (!s) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function toPlainEmail(s: string): string {
  const t = String(s).trim()
  const out: string[] = []
  for (let i = 0; i < t.length; i++) {
    const code = t.charCodeAt(i)
    if (code > 31 && code !== 127) out.push(t[i]!)
  }
  return out.join('')
}

async function sendEmail(to: string[], subject: string, html: string): Promise<{ id?: string; error?: string }> {
  const sub = String(subject).trim()
  const h = String(html).trim()
  if (!sub || !h) throw new Error('sendEmail: subject and html are required')
  const normalized = normalizeEmails(to)
  if (normalized.length === 0) throw new Error('sendEmail: no valid email addresses in to')
  let toPayload: string[] = normalized.map((e) => toPlainEmail(String(e))).filter((e) => e.length > 0 && e.length <= 254 && EMAIL_REGEX.test(e))
  toPayload = toPayload.filter((e) => e && String(e).trim().length > 0)
  if (toPayload.length === 0) throw new Error('sendEmail: no valid email addresses after sanitization')
  const payload = { from: FROM_EMAIL, to: toPayload, subject: sub, html: h }
  const bodyStr = JSON.stringify(payload)
  console.log('[Resend] request to =', JSON.stringify(toPayload), 'from =', FROM_EMAIL)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: bodyStr,
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('[Resend] Error response:', JSON.stringify(data))
    console.error('[Resend] Request was: to=', JSON.stringify(toPayload), 'from=', FROM_EMAIL)
    throw new Error(data?.message || data?.error || `Resend error: ${JSON.stringify(data)}`)
  }
  console.log('[Resend] Sent successfully, id:', data?.id)
  return data
}

function orderDisplayId(orderData: { order_number?: string | null; id?: string }): string {
  return (orderData.order_number || (orderData.id || '').slice(0, 8).toUpperCase()) as string
}

// Resend requires "email@example.com" or "Name <email@example.com>". We send plain addresses only.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function normalizeEmails(candidates: (string | null | undefined)[]): string[] {
  const out: string[] = []
  for (const c of candidates) {
    const s = (typeof c === 'string' ? c : typeof c === 'number' ? String(c) : '').trim().replace(/\s+/g, ' ')
    const clean = s.replace(/[\u0000-\u001F\u007F]/g, '') // strip control chars
    if (clean.length > 0 && EMAIL_REGEX.test(clean)) out.push(clean)
  }
  return [...new Set(out)]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    // Support Supabase Database Webhook payload (trigger on orders INSERT so client can navigate away immediately)
    const isDbWebhook = body.type === 'INSERT' && body.table === 'orders' && body.record != null
    const type = isDbWebhook ? 'new_order' : body.type
    const rawOrder = isDbWebhook ? body.record : body.orderData
    const newStatus = body.newStatus
    // Support both snake_case (Supabase DB) and camelCase (some clients)
    const orderData = rawOrder && typeof rawOrder === 'object' ? rawOrder as Record<string, unknown> : {}
    if (type === 'new_order' && (rawOrder == null || typeof rawOrder !== 'object')) {
      console.error('[Notification] new_order requires orderData object')
      throw new Error('orderData is required for new_order')
    }
    const get = (obj: Record<string, unknown>, ...keys: string[]) => {
      for (const k of keys) {
        const v = obj[k]
        if (v != null && v !== '') return v as string | number
      }
      return ''
    }
    console.log(`[Notification] type=${type} orderId=${orderData?.id} hasCustomerEmail=${!!(orderData.customer_email || orderData.customerEmail)} source=${isDbWebhook ? 'db_webhook' : 'client'}`)

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const orderId = orderDisplayId(orderData)
    const createdAt = orderData.created_at ?? orderData.createdAt
    const orderDate = createdAt
      ? new Date(createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : ''

    const totalAmount = orderData.total_amount ?? orderData.totalAmount
    const totalFormatted = (totalAmount != null ? Number(totalAmount).toFixed(2) : '0.00')
    const customerName = escapeHtml(String(get(orderData, 'customer_name', 'customerName') || ''))
    // Customer = user who placed the order (from checkout form → order.customer_email)
    const customerEmail = String(get(orderData, 'customer_email', 'customerEmail') || '').trim()
    const customerPhone = escapeHtml(String(get(orderData, 'customer_phone', 'customerPhone') || ''))
    const shippingAddress = escapeHtml(String(get(orderData, 'shipping_address', 'shippingAddress') || ''))

    const itemsList =
      orderData.items?.map((item: { name?: string; size?: string; quantity?: number; price?: number }) => {
        const name = escapeHtml(item.name || '')
        const size = item.size || 'N/A'
        const qty = item.quantity ?? 0
        const price = (item.price ?? 0).toFixed(2)
        const lineTotal = ((item.price ?? 0) * qty).toFixed(2)
        return `
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee;">${name}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center;">${size}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center;">${qty}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right;">₾${price}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right;">₾${lineTotal}</td>
          </tr>
        `
      }).join('') || '<tr><td colspan="5" style="padding: 8px;">No items listed</td></tr>'

    // Calculate subtotal from items to infer shipping cost
    const itemsSubtotal = orderData.items?.reduce((sum: number, item: { price?: number; quantity?: number }) => {
      return sum + ((item.price ?? 0) * (item.quantity ?? 1))
    }, 0) ?? 0
    const shippingCost = (Number(totalAmount) - itemsSubtotal)
    // Avoid -0.00 issues or small floating point diffs
    const shippingFormatted = shippingCost > 0.01 ? shippingCost.toFixed(2) : '0.00'

    if (type === 'new_order') {
      const rawAdmin: (string | null | undefined)[] = [ADMIN_EMAIL]
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('email')
        .eq('is_admin', true)
      if (Array.isArray(adminProfiles)) {
        for (const p of adminProfiles) {
          if (p && typeof p === 'object') {
            const e = (p as Record<string, unknown>).email ?? (p as Record<string, unknown>).Email
            if (e != null && String(e).trim()) rawAdmin.push(typeof e === 'string' ? e : String(e))
          }
        }
      }
      const adminTo = normalizeEmails(rawAdmin)
      if (adminTo.length === 0) {
        throw new Error('No valid admin email (ADMIN_EMAIL or profiles.email)')
      }
      console.log('[Admin] resolved to:', JSON.stringify(adminTo))

      const adminHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>New Order</title></head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #141414; max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="background-color: #141414; padding: 40px 20px; text-align: center;">
            <p style="color: #D9A91A; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0;">Aurora Shop</p>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 1px;">New Order Received</h1>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #f0f0f0;">
            <div style="margin-bottom: 40px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; color: #141414; font-size: 18px; font-weight: 600;">Order #${orderId}</h2>
              <p style="margin: 0; color: #666; font-size: 14px;">${orderDate}</p>
            </div>
            
            <div style="background: #fcfcfc; padding: 25px; border-radius: 4px; margin-bottom: 30px; border: 1px solid #eee;">
              <h3 style="margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 10px;">Customer Details</h3>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${customerName || 'N/A'}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #D9A91A; text-decoration: none;">${customerEmail || 'N/A'}</a></p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> ${customerPhone || 'N/A'}</p>
              <p style="margin: 8px 0;"><strong>Shipping Address:</strong><br/><span style="color: #666;">${shippingAddress || 'N/A'}</span></p>
            </div>

            <div style="margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background: #f9f9f9; color: #666;">
                    <th style="padding: 10px; text-align: left; font-weight: 500;">Product</th>
                    <th style="padding: 10px; text-align: center; font-weight: 500;">Size</th>
                    <th style="padding: 10px; text-align: center; font-weight: 500;">Qty</th>
                    <th style="padding: 10px; text-align: right; font-weight: 500;">Price</th>
                    <th style="padding: 10px; text-align: right; font-weight: 500;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemsList}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="padding: 15px 10px 5px; text-align: right; color: #666;">Subtotal:</td>
                    <td style="padding: 15px 10px 5px; text-align: right;">₾${itemsSubtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="4" style="padding: 5px 10px; text-align: right; color: #666;">Shipping:</td>
                    <td style="padding: 5px 10px; text-align: right;">₾${shippingFormatted}</td>
                  </tr>
                  <tr>
                    <td colspan="4" style="padding: 15px 10px; text-align: right; font-weight: 600; font-size: 16px; border-top: 1px solid #eee; color: #141414;">Grand Total:</td>
                    <td style="padding: 15px 10px; text-align: right; font-weight: 600; font-size: 16px; border-top: 1px solid #eee; color: #D9A91A;">₾${totalFormatted}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: #fff8e1; padding: 15px; border-radius: 4px; border-left: 3px solid #D9A91A; margin-top: 30px;">
              <p style="margin: 0; color: #856404; font-size: 14px;"><strong>⚠️ Action Required:</strong> Please review and fulfill this order in the admin panel.</p>
            </div>
            
            ${baseUrl ? `<div style="text-align: center; margin-top: 40px;"><a href="${baseUrl}/admin" style="background: #141414; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 0; display: inline-block; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; transition: background 0.3s;">View in Admin</a></div>` : ''}
          </div>
          <div style="text-align: center; padding: 20px; background: #f9f9f9; color: #999; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Aurora Shop. All rights reserved.</p>
          </div>
        </body>
        </html>
      `

      const customerHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Confirmation</title></head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #141414; max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="background-color: #141414; padding: 40px 20px; text-align: center;">
            <img src="https://aurora.com.ge/assets/logo-BbjWekn0.png" alt="Aurora" width="60" height="60" style="display:block; margin:0 auto 20px auto; border-radius:50%;" />
            <p style="color: #D9A91A; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0;">Thank you</p>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 1px;">Order Confirmed</h1>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #f0f0f0;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${customerName || 'there'},</p>
            <p style="margin: 0 0 30px 0; color: #666;">We have received your order <strong>#${orderId}</strong> and are getting it ready!</p>
            
            <div style="background: #fcfcfc; padding: 25px; border-radius: 4px; margin-bottom: 30px; border: 1px solid #eee;">
              <div style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Order Total</p>
                <p style="margin: 0; font-size: 24px; font-weight: 600; color: #D9A91A;">₾${totalFormatted}</p>
              </div>
              <div>
                 <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Shipping To</p>
                 <p style="margin: 0; color: #141414;">${shippingAddress || '—'}</p>
              </div>
            </div>

            <div style="margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 10px;">Items</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 1px solid #eee; color: #999;">
                    <th style="padding: 10px 0; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 500;">Product</th>
                    <th style="padding: 10px 8px; text-align: center; font-size: 11px; text-transform: uppercase; font-weight: 500;">Size</th>
                    <th style="padding: 10px 8px; text-align: center; font-size: 11px; text-transform: uppercase; font-weight: 500;">Qty</th>
                    <th style="padding: 10px 8px; text-align: right; font-size: 11px; text-transform: uppercase; font-weight: 500;">Price</th>
                    <th style="padding: 10px 0; text-align: right; font-size: 11px; text-transform: uppercase; font-weight: 500;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemsList}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="padding: 15px 0 5px 0; text-align: right; color: #666;">Subtotal</td>
                    <td style="padding: 15px 0 5px 0; text-align: right;">₾${itemsSubtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="4" style="padding: 5px 0; text-align: right; color: #666;">Shipping</td>
                    <td style="padding: 5px 0; text-align: right;">₾${shippingFormatted}</td>
                  </tr>
                  <tr>
                    <td colspan="4" style="padding: 15px 0 0 0; text-align: right; font-weight: 600; border-top: 1px solid #eee; color: #141414;">Total</td>
                    <td style="padding: 15px 0 0 0; text-align: right; font-weight: 600; border-top: 1px solid #eee; color: #D9A91A;">₾${totalFormatted}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p style="margin: 0 0 30px 0; font-size: 14px; color: #666; text-align: center;">If you have any questions about your order, please reply directly to this email.</p>
            
            ${baseUrl ? `<div style="text-align: center;"><a href="${baseUrl}/profile" style="color: #141414; text-decoration: underline; font-size: 14px; font-weight: 500;">View your orders</a></div>` : ''}
          </div>
          <div style="text-align: center; padding: 30px; background: #f9f9f9; color: #999; font-size: 12px;">
             <p style="margin-bottom: 10px;">Aurora Shop</p>
             <div style="opacity: 0.5;">
               <a href="#" style="color: #999; text-decoration: none; margin: 0 5px;">Instagram</a> • 
               <a href="#" style="color: #999; text-decoration: none; margin: 0 5px;">Facebook</a>
             </div>
          </div>
        </body>
        </html>
      `

      let adminSent = false
      let customerSent = false
      let customerError: string | null = null

      // 1. Send to admin(s)
      try {
        console.log('[Admin] Sending to:', adminTo.join(', '))
        await sendEmail(adminTo, `🛍️ New Order #${orderId} - ₾${totalFormatted}`, adminHtml)
        adminSent = true
      } catch (e) {
        console.error('[Admin] Send failed:', e?.message ?? e)
        throw e
      }

      // 2. Send to customer (order confirmation) – use same validation as Resend
      const customerTo = normalizeEmails([customerEmail])
      if (customerTo.length > 0) {
        try {
          console.log('[Customer] Sending confirmation to:', JSON.stringify(customerTo))
          await sendEmail(customerTo, `Order confirmation #${orderId} - Aurora`, customerHtml)
          customerSent = true
        } catch (e) {
          customerError = e?.message ?? String(e)
          console.error('[Customer] Send failed:', customerError)
          // Don't throw – admin email already sent; report in response
        }
      } else {
        console.warn('[Customer] Skipped: no valid customer email (received:', customerEmail ? 'invalid format' : 'empty', ')')
      }

      return new Response(
        JSON.stringify({
          success: true,
          adminSent,
          customerSent,
          ...(customerError ? { customerError } : {}),
          message: adminSent && customerSent ? 'Admin and customer emails sent' : adminSent ? 'Admin email sent; customer email failed or skipped' : 'Admin email sent',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (type === 'status_update') {
      const rawTo = String(get(orderData, 'customer_email', 'customerEmail') || '').trim()
      const toList = normalizeEmails([rawTo])
      if (toList.length === 0) throw new Error('Customer email required for status_update (invalid or empty)')
      const to = toList[0]

      const statusHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Update</title></head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #141414; max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="background-color: #141414; padding: 40px 20px; text-align: center;">
            <p style="color: #D9A91A; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0;">Aurora Shop</p>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 1px;">Status Update</h1>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #f0f0f0;">
            <p style="font-size: 16px;">Hi ${customerName || 'there'},</p>
            <p style="color: #666;">The status of your order <strong>#${orderId}</strong> has been updated:</p>
            
            <div style="background: #fcfcfc; padding: 30px; border-radius: 4px; margin: 30px 0; text-align: center; border: 1px solid #eee;">
              <h2 style="margin: 0; color: #D9A91A; font-size: 24px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(newStatus || '')}</h2>
            </div>
            
            <p style="color: #666; margin-bottom: 30px;">Thank you for shopping with us.</p>
            
            ${baseUrl ? `<div style="text-align: center;"><a href="${baseUrl}/profile" style="background: #141414; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 0; display: inline-block; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; transition: background 0.3s;">View your orders</a></div>` : ''}
          </div>
          <div style="text-align: center; padding: 30px; background: #f9f9f9; color: #999; font-size: 12px;">
             <p>Aurora Shop</p>
          </div>
        </body>
        </html>
      `

      await sendEmail(toList, `Order #${orderId} - Status: ${newStatus || 'updated'}`, statusHtml)
      return new Response(JSON.stringify({ success: true, message: 'Status update email sent' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error(`Invalid notification type: ${type}`)
  } catch (error) {
    console.error('Function error:', error?.message ?? error)
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Unknown error', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
