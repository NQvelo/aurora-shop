import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
// Supabase URL and service role key - set these as secrets if you want to fetch admin emails from DB
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_PROJECT_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, orderData, newStatus } = await req.json()
    console.log(`Received ${type} request for order ${orderData?.id}`)

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    // Create Supabase client with service role for admin queries
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    let subject = ''
    let html = ''
    let to = ''

    if (type === 'new_order') {
      // Get admin email(s) from profiles table
      const { data: adminProfiles, error: adminError } = await supabase
        .from('profiles')
        .select('email')
        .eq('is_admin', true)

      if (adminError) {
        console.error('Error fetching admin emails:', adminError)
      }

      // Use admin email from database, fallback to hardcoded email
      const adminEmails = adminProfiles?.map(p => p.email).filter(Boolean) || ['teklaqvelidze@gmail.com']
      to = adminEmails.join(',')

      const orderId = orderData.id.slice(0, 8).toUpperCase()
      const orderDate = new Date(orderData.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      // Calculate item details
      const itemsList = orderData.items?.map((item: any) => {
        const itemTotal = (item.price * item.quantity).toFixed(2)
        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.size || 'N/A'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₾${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₾${itemTotal}</td>
          </tr>
        `
      }).join('') || '<tr><td colspan="5" style="padding: 8px;">No items listed</td></tr>'

      subject = `🛍️ New Order #${orderId} - ₾${orderData.total_amount.toFixed(2)}`
      
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🛍️ New Order Received!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="margin-top: 0; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                Order #${orderId}
              </h2>
              <p style="margin: 5px 0;"><strong>📅 Order Date:</strong> ${orderDate}</p>
              <p style="margin: 5px 0;"><strong>💰 Total Amount:</strong> <span style="font-size: 20px; color: #667eea; font-weight: bold;">₾${orderData.total_amount.toFixed(2)}</span></p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">👤 Customer Information</h3>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${orderData.customer_name || 'N/A'}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${orderData.customer_email}" style="color: #667eea;">${orderData.customer_email || 'N/A'}</a></p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${orderData.customer_phone}" style="color: #667eea;">${orderData.customer_phone || 'N/A'}</a></p>
              <p style="margin: 8px 0;"><strong>Shipping Address:</strong></p>
              <p style="margin: 8px 0; padding-left: 20px; color: #666; white-space: pre-wrap;">${orderData.shipping_address || 'N/A'}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">📦 Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #667eea;">Product</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #667eea;">Size</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #667eea;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #667eea;">Price</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #667eea;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #667eea;">Grand Total:</td>
                    <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #667eea; border-top: 2px solid #667eea;">₾${orderData.total_amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 20px;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Action Required:</strong> Please review this order and update its status in the admin panel.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${SUPABASE_URL.replace('/rest/v1', '')}/admin/orders" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View Order in Admin Panel
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated notification from Aurora Shop</p>
          </div>
        </body>
        </html>
      `
    } else if (type === 'status_update') {
      to = orderData.customer_email
      const orderId = orderData.id.slice(0, 8).toUpperCase()
      subject = `Order Update: #${orderId} - Status: ${newStatus}`
      
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📦 Order Status Updated</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p>Hi ${orderData.customer_name},</p>
            
            <p>Your order <strong>#${orderId}</strong> status has been updated:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="margin: 0; color: #667eea; font-size: 24px;">${newStatus}</h2>
            </div>
            
            <p>Thank you for shopping with Aurora! We'll keep you updated on your order progress.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${SUPABASE_URL.replace('/rest/v1', '')}/profile" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View Your Orders
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated notification from Aurora Shop</p>
          </div>
        </body>
        </html>
      `
    }

    if (!to || !subject || !html) {
      throw new Error(`Invalid notification type: ${type}`)
    }

    console.log(`Sending email to ${to}...`)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // IMPORTANT: Replace 'aurora.ge' with your actual verified domain from Resend.com
        from: 'Aurora Shop <orders@aurora.ge>',
        to: to.split(','),
        subject: subject,
        html: html,
      }),
    })

    const resData = await res.json()
    console.log('Resend response:', JSON.stringify(resData))

    if (!res.ok) {
      throw new Error(`Resend error: ${JSON.stringify(resData)}`)
    }

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully', data: resData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Function error:', error.message)
    return new Response(JSON.stringify({ error: error.message, success: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
