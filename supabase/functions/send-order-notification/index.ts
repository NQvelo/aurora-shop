import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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

    let subject = ''
    let html = ''
    let to = ''

    if (type === 'new_order') {
      to = 'teklaqvelidze@gmail.com'
      subject = `New Order #${orderData.id.slice(0, 8)}`
      html = `
        <h1>New Order Received</h1>
        <p><strong>Customer:</strong> ${orderData.customer_name}</p>
        <p><strong>Email:</strong> ${orderData.customer_email}</p>
        <p><strong>Total:</strong> ₾${orderData.total_amount}</p>
        <p><strong>Items:</strong> ${orderData.items?.map((i: any) => `${i.name} (${i.size}) x${i.quantity}`).join(', ') || 'No items listed'}</p>
      `
    } else if (type === 'status_update') {
      to = orderData.customer_email
      subject = `Order Update: #${orderData.id.slice(0, 8)}`
      html = `
        <h1>Order Status Updated</h1>
        <p>Hi ${orderData.customer_name},</p>
        <p>Your order status has been changed to: <strong>${newStatus}</strong>.</p>
        <p>Thank you for shopping with Aurora!</p>
      `
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
        from: 'Aurora <orders@aurora.ge>',
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    const resData = await res.json()
    console.log('Resend response:', JSON.stringify(resData))

    if (!res.ok) {
      throw new Error(`Resend error: ${JSON.stringify(resData)}`)
    }

    return new Response(JSON.stringify(resData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Function error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
