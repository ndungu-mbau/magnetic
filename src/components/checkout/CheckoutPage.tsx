'use client'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Address, Media, Product, Variant } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { useAddresses, useEcommerce, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

type CashInitiateResult = { transactionID: string; message: string }
type CashConfirmResult = {
  orderID: string
  transactionID: string
  accessToken?: string
  message: string
}

function getProductImage(product: Product): string | undefined {
  const first = product.gallery?.[0]
  if (!first) return undefined
  const img = first.image
  if (typeof img === 'object' && img !== null) return (img as Media).url ?? undefined
  return undefined
}

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useEcommerce()
  const { initiatePayment, confirmOrder } = usePayments()
  const { addresses } = useAddresses()

  const [email, setEmail] = useState('')
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill first saved address for logged-in users.
  useEffect(() => {
    if (!billingAddress && addresses && addresses.length > 0) {
      setBillingAddress(addresses[0])
    }
  }, [addresses]) // eslint-disable-line react-hooks/exhaustive-deps

  const cartItems: any[] = (cart as any)?.items ?? []
  const cartIsEmpty = cartItems.length === 0
  const subtotal: number = (cart as any)?.subtotal ?? 0

  const customerEmail = user?.email || (emailConfirmed ? email : undefined)
  const canPlaceOrder =
    Boolean(customerEmail) &&
    Boolean(billingAddress) &&
    (shippingSameAsBilling || Boolean(shippingAddress))

  const handlePlaceOrder = useCallback(async () => {
    if (!canPlaceOrder || isPlacingOrder) return
    setError(null)
    setIsPlacingOrder(true)

    const finalShipping = shippingSameAsBilling ? billingAddress : shippingAddress

    try {
      // Step 1 — create a pending transaction.
      const initiateResult = (await initiatePayment('cash', {
        additionalData: {
          customerEmail,
          billingAddress,
          shippingAddress: finalShipping,
        },
      })) as CashInitiateResult

      if (!initiateResult?.transactionID) {
        throw new Error('Did not receive a transaction ID from the server.')
      }

      // Step 2 — immediately confirm (no external payment processor to wait for).
      const confirmResult = (await confirmOrder('cash', {
        additionalData: {
          transactionID: initiateResult.transactionID,
          customerEmail,
        },
      })) as CashConfirmResult

      if (!confirmResult?.orderID) {
        throw new Error('Did not receive an order ID from the server.')
      }

      // Build the query string for guest access.
      const params = new URLSearchParams()
      if (!user && email) params.set('email', email)
      if (confirmResult.accessToken) params.set('accessToken', confirmResult.accessToken)
      const qs = params.toString()

      router.push(`/orders/${confirmResult.orderID}${qs ? `?${qs}` : ''}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.'
      setError(msg)
      toast.error(msg)
      setIsPlacingOrder(false)
    }
  }, [
    canPlaceOrder,
    isPlacingOrder,
    customerEmail,
    billingAddress,
    shippingAddress,
    shippingSameAsBilling,
    initiatePayment,
    confirmOrder,
    router,
    user,
    email,
  ])

  if (cartIsEmpty && !isPlacingOrder) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="italic text-muted-foreground">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-foreground px-8 py-3 text-sm text-background transition hover:bg-primary"
        >
          Return to the collection
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_22rem]">
      {/* ── Left column: contact + address ── */}
      <div className="space-y-10">
        {/* Contact */}
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl">Contact</legend>

          {user ? (
            <div className="border border-border/60 bg-secondary/30 p-4 text-sm">
              <p className="font-medium">{user.email}</p>
              <p className="mt-1 text-muted-foreground">
                Not you?{' '}
                <Link href="/logout" className="underline underline-offset-4 hover:text-foreground">
                  Sign out
                </Link>
              </p>
            </div>
          ) : emailConfirmed ? (
            <div className="border border-border/60 bg-secondary/30 p-4 text-sm">
              <p className="font-medium">{email}</p>
              <button
                onClick={() => {
                  setEmailConfirmed(false)
                  setEmail('')
                }}
                className="mt-1 text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
                  Sign in
                </Link>{' '}
                or continue as a guest.
              </p>
              <GuestEmailField
                value={email}
                onChange={setEmail}
                onConfirm={() => setEmailConfirmed(true)}
              />
            </div>
          )}
        </fieldset>

        {/* Billing address */}
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl">Address</legend>

          {billingAddress ? (
            <div>
              <AddressItem
                address={billingAddress}
                actions={
                  <button
                    onClick={() => setBillingAddress(undefined)}
                    disabled={isPlacingOrder}
                    className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Remove
                  </button>
                }
              />
            </div>
          ) : user ? (
            <CheckoutAddresses heading="Billing address" setAddress={setBillingAddress} />
          ) : (
            <CreateAddressModal
              disabled={!customerEmail}
              callback={(addr) => setBillingAddress(addr)}
              skipSubmission
            />
          )}
        </fieldset>

        {/* Shipping same as billing */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="shippingSameAsBilling"
            checked={shippingSameAsBilling}
            disabled={isPlacingOrder || (!user && !customerEmail)}
            onCheckedChange={(v) => setShippingSameAsBilling(Boolean(v))}
          />
          <Label htmlFor="shippingSameAsBilling" className="text-sm">
            Shipping address is the same as billing
          </Label>
        </div>

        {!shippingSameAsBilling && (
          <fieldset className="space-y-4">
            <legend className="font-display text-2xl">Shipping address</legend>

            {shippingAddress ? (
              <AddressItem
                address={shippingAddress}
                actions={
                  <button
                    onClick={() => setShippingAddress(undefined)}
                    disabled={isPlacingOrder}
                    className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Remove
                  </button>
                }
              />
            ) : user ? (
              <CheckoutAddresses
                heading="Shipping address"
                description="Please select a shipping address."
                setAddress={setShippingAddress}
              />
            ) : (
              <CreateAddressModal
                disabled={!customerEmail}
                callback={(addr) => setShippingAddress(addr)}
                skipSubmission
              />
            )}
          </fieldset>
        )}

        {/* Payment note */}
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl">Payment</legend>
          <div className="border border-border/60 bg-secondary/30 p-5 text-sm">
            <p className="eyebrow text-primary">Cash on delivery</p>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Payment is collected when your order arrives. We accept cash only; our courier will
              bring an invoice. Please have the exact amount ready.
            </p>
          </div>
        </fieldset>

        {error && (
          <p className="text-sm text-red-500 border border-red-200 bg-red-50 p-3 rounded">
            {error}
          </p>
        )}

        <button
          onClick={handlePlaceOrder}
          disabled={!canPlaceOrder || isPlacingOrder}
          className="w-full rounded-full bg-foreground px-8 py-4 text-sm tracking-wide text-background transition hover:bg-primary disabled:opacity-50"
        >
          {isPlacingOrder ? 'Placing order…' : `Place order · $${subtotal.toFixed(2)}`}
        </button>
      </div>

      {/* ── Right column: order summary ── */}
      <aside className="h-fit border border-border/60 bg-secondary/30 p-6">
        <span className="eyebrow text-primary">Your order</span>

        <ul className="mt-5 space-y-4">
          {cartItems.map((item: any, idx: number) => {
            const product =
              typeof item.product === 'object' && item.product ? (item.product as Product) : null
            const variant =
              typeof item.variant === 'object' && item.variant ? (item.variant as Variant) : null
            const imageUrl = product ? getProductImage(product) : undefined
            const price = variant?.priceInKES ?? product?.priceInKES ?? 0

            return (
              <li key={item.id ?? idx} className="flex gap-3 text-sm">
                <div className="h-14 w-12 shrink-0 overflow-hidden bg-gradient-to-br from-blush via-rose/40 to-lavender/30">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={product?.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-base leading-tight">
                      {product?.title ?? 'Product'}
                    </div>
                    {variant?.title && (
                      <div className="text-xs text-muted-foreground">
                        {variant.title} · qty {item.quantity}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">${((price ?? 0) * item.quantity).toFixed(2)}</div>
                </div>
              </li>
            )
          })}
        </ul>

        <dl className="mt-6 space-y-2 border-t border-border/60 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>${subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>Complimentary</dd>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-2">
            <dt>
              <span className="font-display text-lg">Total</span>
            </dt>
            <dd>
              <span className="font-display text-lg">${subtotal.toFixed(2)}</span>
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function GuestEmailField({
  value,
  onChange,
  onConfirm,
}: {
  value: string
  onChange: (v: string) => void
  onConfirm: () => void
}) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="eyebrow text-muted-foreground">Email</span>
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="your@email.com"
          className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground"
        />
      </label>
      <button
        type="button"
        disabled={!isValid}
        onClick={onConfirm}
        className="rounded-full border border-foreground px-5 py-2 text-sm transition hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        Continue as guest
      </button>
    </div>
  )
}
