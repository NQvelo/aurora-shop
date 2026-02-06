# Order email template for Resend.com

Use `order-notification.html` as the **HTML body** for Resend.com (e.g. in the Resend dashboard or via API when sending order notifications).

## Placeholders

Replace these in your HTML (or in code before sending) with real values:

| Placeholder | Description | Example |
|------------|-------------|--------|
| `{{ORDER_NUMBER}}` | Short order ID | `A1B2C3D` |
| `{{ORDER_DATE}}` | Formatted order date | `February 3, 2025, 2:30 PM` |
| `{{CURRENCY_SYMBOL}}` | Currency symbol | `₾` |
| `{{TOTAL_AMOUNT}}` | Order total (number, 2 decimals) | `149.00` |
| `{{CUSTOMER_NAME}}` | Customer full name | `Jane Doe` |
| `{{CUSTOMER_EMAIL}}` | Customer email | `jane@example.com` |
| `{{CUSTOMER_PHONE}}` | Customer phone | `+995 555 123 456` |
| `{{SHIPPING_ADDRESS}}` | Full shipping address (single line or block) | `Rustaveli Ave, № 12, 0108, Tbilisi` |
| `{{ITEMS_TABLE_BODY}}` | Table rows for each line item (see below) | HTML `<tr>...</tr>` rows |
| `{{ADMIN_ORDERS_URL}}` | Link to admin orders page | `https://yoursite.com/admin` (or your admin orders URL) |

## Items table body

`{{ITEMS_TABLE_BODY}}` must be one or more table rows. For each order item, output a `<tr>` like this (same styles as in the template):

```html
<tr>
  <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">Product Name</td>
  <td align="center" style="padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 14px;">M</td>
  <td align="center" style="padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 14px;">2</td>
  <td align="right" style="padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 14px;">₾45.00</td>
  <td align="right" style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">₾90.00</td>
</tr>
```

If there are no items, use a single row:

```html
<tr><td colspan="5" style="padding: 12px 0; color: #888; font-size: 14px;">No items</td></tr>
```

## Using with Resend

1. **In Resend dashboard**  
   Create an email (or template) and paste the contents of `order-notification.html`. Replace the placeholders with your dynamic values when sending (e.g. via API with a template engine, or Resend’s variable syntax if supported).

2. **Via Resend API**  
   In your app or Supabase Edge Function, load this HTML (or an equivalent string), replace all `{{...}}` placeholders with the current order data, then send with Resend:

   ```js
   const html = template
     .replace(/\{\{ORDER_NUMBER\}\}/g, orderNumber)
     .replace(/\{\{ORDER_DATE\}\}/g, orderDate)
     // ... etc for each placeholder
     .replace(/\{\{ITEMS_TABLE_BODY\}\}/g, itemsRows);
   ```

The Supabase function `send-order-notification` builds equivalent HTML inline; you can switch it to use this file or the same structure for consistency.
