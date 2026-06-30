import type { PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types'

/**
 * Client-side descriptor for the cash adapter.
 * No secrets — this is safe to ship to the browser.
 */
export const cashAdapterClient = (): PaymentAdapterClient => ({
  name: 'cash',
  label: 'Cash on delivery',
  initiatePayment: true,
  confirmOrder: true,
})
