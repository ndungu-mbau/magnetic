'use client'

import type { Media, Product, Variant } from '@/payload-types'
import { useEcommerce } from '@payloadcms/plugin-ecommerce/client/react'
import { Minus, Plus, X } from 'lucide-react'
import Link from 'next/link'

function getProductImage(product: Product): string | undefined {
  const first = product.gallery?.[0]
  if (!first) return undefined
  const img = first.image
  if (typeof img === 'object' && img !== null) return (img as Media).url ?? undefined
  return undefined
}

const SHIPPING = 0

export default function CartPage() {
  const { cart, removeItem, incrementItem, decrementItem, isLoading } = useEcommerce()

  const items: any[] = (cart as any)?.items ?? []

  const subtotal = items.reduce((sum, item) => {
    const price =
      (typeof item.variant === 'object' && item.variant !== null
        ? (item.variant as Variant).priceInKES
        : null) ??
      (typeof item.product === 'object' && item.product !== null
        ? (item.product as Product).priceInKES
        : null) ??
      0
    return sum + (price ?? 0) * item.quantity
  }, 0)

  return (
    <div className="bg-background">
      <header className="mx-auto max-w-7xl px-6 pb-12 pt-20 text-center">
        <span className="eyebrow text-primary">Your selection</span>
        <h1 className="mt-6 font-display text-5xl md:text-6xl">The cart</h1>
      </header>

      {items.length === 0 ? (
        <div className="mx-auto max-w-md px-6 pb-32 text-center">
          <p className="italic text-muted-foreground">Nothing in the bottle just yet.</p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-foreground px-8 py-3 text-sm text-background transition hover:bg-primary"
          >
            Wander the collection
          </Link>
        </div>
      ) : (
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[1fr_22rem]">
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {items.map((item) => {
              const product =
                typeof item.product === 'object' && item.product !== null
                  ? (item.product as Product)
                  : null
              const variant =
                typeof item.variant === 'object' && item.variant !== null
                  ? (item.variant as Variant)
                  : null

              const imageUrl = product ? getProductImage(product) : undefined
              const displayName = product?.title ?? 'Product'
              const variantLabel = variant?.title ?? ''
              const price: number = (variant?.priceInKES ?? product?.priceInKES ?? 0) as number

              return (
                <li key={item.id} className="flex gap-5 py-6">
                  {product?.slug ? (
                    <Link
                      href={`/shop/${product.slug}`}
                      className="block h-28 w-24 shrink-0 overflow-hidden bg-gradient-to-br from-blush via-rose/40 to-lavender/30"
                    >
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </Link>
                  ) : (
                    <div className="block h-28 w-24 shrink-0 overflow-hidden bg-gradient-to-br from-blush via-rose/40 to-lavender/30">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {product?.slug ? (
                          <Link
                            href={`/shop/${product.slug}`}
                            className="font-display text-xl hover:underline underline-offset-4"
                          >
                            {displayName}
                          </Link>
                        ) : (
                          <div className="font-display text-xl">{displayName}</div>
                        )}
                        {variantLabel && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {variantLabel} · ${(price as number).toFixed(2)} each
                          </p>
                        )}
                      </div>
                      <button
                        aria-label="Remove"
                        onClick={() => item.id && removeItem(item.id)}
                        disabled={isLoading}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-4">
                      <div className="inline-flex items-center border border-border">
                        <button
                          aria-label="Decrease"
                          onClick={() => item.id && decrementItem(item.id)}
                          disabled={isLoading}
                          className="px-3 py-2 text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          aria-label="Increase"
                          onClick={() => item.id && incrementItem(item.id)}
                          disabled={isLoading}
                          className="px-3 py-2 text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="font-display text-lg">
                        ${((price ?? 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <aside className="h-fit border border-border/60 bg-secondary/30 p-6">
            <span className="eyebrow text-primary">Summary</span>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>Complimentary</dd>
              </div>
              <div className="border-t border-border/60 pt-3">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">
                    <span className="font-display text-lg">Total</span>
                  </dt>
                  <dd>
                    <span className="font-display text-lg">
                      ${(subtotal + SHIPPING).toFixed(2)}
                    </span>
                  </dd>
                </div>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="mt-6 block rounded-full bg-foreground px-8 py-3 text-center text-sm text-background transition hover:bg-primary"
            >
              Proceed to checkout
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Complimentary samples included with every order.
            </p>
          </aside>
        </section>
      )}
    </div>
  )
}
