import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import type { GroupField } from 'payload'

export const cashAdapter = (): PaymentAdapter => ({
  name: 'cash',
  label: 'Cash on delivery',

  // This group field is added to the Transactions collection in the admin UI.
  group: {
    name: 'cash',
    type: 'group',
    label: 'Cash on delivery',
    admin: { hideGutter: true },
    fields: [
      {
        name: 'shippingAddress',
        type: 'group',
        label: 'Shipping address',
        admin: { readOnly: true, description: 'Captured at order time.' },
        fields: [
          { name: 'firstName', type: 'text', label: 'First name' },
          { name: 'lastName', type: 'text', label: 'Last name' },
          { name: 'addressLine1', type: 'text', label: 'Address line 1' },
          { name: 'addressLine2', type: 'text', label: 'Address line 2' },
          { name: 'city', type: 'text', label: 'City' },
          { name: 'state', type: 'text', label: 'State / region' },
          { name: 'postalCode', type: 'text', label: 'Postal code' },
          { name: 'country', type: 'text', label: 'Country' },
        ],
      },
    ],
  } as GroupField,

  /**
   * Called at POST /api/payments/cash/initiate.
   *
   * The plugin endpoint wrapper supplies:
   *   data.cart          – the live Cart document (depth 2)
   *   data.currency      – active currency code
   *   data.customerEmail – from additionalData
   *   data.billingAddress  – from additionalData
   *   data.shippingAddress – from additionalData
   */
  initiatePayment: async ({ data, req, transactionsSlug }) => {
    const { cart, customerEmail, billingAddress, shippingAddress, currency } = data

    const customerId =
      typeof cart.customer === 'object' && cart.customer ? cart.customer.id : cart.customer

    const transaction = await req.payload.create({
      collection: transactionsSlug as 'transactions',
      req,
      data: {
        status: 'pending',
        paymentMethod: 'cash',
        cart: cart.id,
        ...(customerId ? { customer: customerId } : {}),
        customerEmail: customerEmail ?? undefined,
        amount: cart.subtotal ?? 0,
        currency: (currency as 'USD') ?? 'USD',
        billingAddress: (billingAddress as any) ?? undefined,
        // Store shipping separately inside the cash group so confirmOrder can read it back.
        cash: {
          shippingAddress: ((shippingAddress ?? billingAddress) as any) ?? undefined,
        },
      } as any,
    })

    return {
      message: 'Cash payment initiated',
      transactionID: transaction.id,
    }
  },

  /**
   * Called at POST /api/payments/cash/confirm-order.
   *
   * additionalData expected from the client:
   *   transactionID – returned by initiatePayment
   *   customerEmail – the guest email (if not logged in)
   */
  confirmOrder: async ({ data, req, ordersSlug, transactionsSlug, cartsSlug }) => {
    const { transactionID, customerEmail: dataEmail } = data

    if (!transactionID) throw new Error('[cash] transactionID is required in confirmOrder data')
    if (!ordersSlug) throw new Error('[cash] ordersSlug was not supplied by the plugin')

    const transaction = (await req.payload.findByID({
      collection: transactionsSlug as 'transactions',
      id: transactionID as string,
      depth: 3,
      req,
    })) as any

    if (!transaction) throw new Error(`[cash] Transaction ${transactionID} not found`)

    const cart = typeof transaction.cart === 'object' ? (transaction.cart as any) : null
    const cashGroup = (transaction as any).cash ?? {}
    const shippingAddress = cashGroup.shippingAddress ?? transaction.billingAddress ?? undefined

    // Build the items array from the cart snapshot in the transaction.
    const items = ((cart?.items as any[]) ?? [])
      .map((item: any) => ({
        product: typeof item.product === 'object' ? item.product?.id : item.product,
        variant: item.variant
          ? typeof item.variant === 'object'
            ? item.variant?.id
            : item.variant
          : undefined,
        quantity: item.quantity,
      }))
      .filter((item: any) => Boolean(item.product))

    const order = await req.payload.create({
      collection: ordersSlug as 'orders',
      req,
      data: {
        customer: transaction.customer ?? undefined,
        customerEmail: (dataEmail ?? transaction.customerEmail) as string | undefined,
        status: 'processing',
        amount: transaction.amount ?? 0,
        currency: transaction.currency ?? 'USD',
        items,
        shippingAddress,
        transactions: [transaction.id],
      } as any,
    })

    // Mark cart as purchased so EcommerceProvider clears it.
    if (cart?.id && cartsSlug) {
      await req.payload.update({
        collection: cartsSlug as 'carts',
        id: cart.id,
        data: { purchasedAt: new Date().toISOString(), status: 'purchased' } as any,
        req,
      })
    }

    // Finalize the transaction.
    await req.payload.update({
      collection: transactionsSlug as 'transactions',
      id: transaction.id,
      data: { status: 'succeeded', order: order.id } as any,
      req,
    })

    return {
      message: 'Order confirmed',
      orderID: order.id,
      transactionID: transaction.id,
      accessToken: (order as any).accessToken ?? undefined,
    }
  },
})
