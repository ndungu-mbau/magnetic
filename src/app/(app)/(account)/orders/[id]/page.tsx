import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Media, Order, Product, Variant } from '@/payload-types'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string; accessToken?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Order ${id.slice(-8).toUpperCase()} — Magnetic Cosmetics` }
}

function getProductImage(product: Product): string | undefined {
  const first = product.gallery?.[0]
  if (!first) return undefined
  const img = first.image
  if (typeof img === 'object' && img !== null) return (img as Media).url ?? undefined
  return undefined
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { id } = await params
  const { email = '', accessToken = '' } = await searchParams

  let order: Order | null = null

  try {
    const { docs } = await payload.find({
      collection: 'orders',
      user,
      overrideAccess: !Boolean(user),
      depth: 2,
      where: {
        and: [
          { id: { equals: id } },
          ...(user
            ? [{ customer: { equals: user.id } }]
            : [
                { accessToken: { equals: accessToken } },
                ...(email ? [{ customerEmail: { equals: email } }] : []),
              ]),
        ],
      },
    })
    order = docs[0] ?? null
  } catch {}

  if (!order) notFound()

  const items = order.items ?? []
  const subtotal = order.amount ?? 0

  return (
    <div className="bg-background">
      <header className="mx-auto max-w-3xl px-6 pb-12 pt-20 text-center">
        <span className="eyebrow text-primary">Thank you</span>
        <h1 className="mt-6 font-display text-5xl italic md:text-6xl">
          Your order is on its way to us.
        </h1>
        {order.customerEmail && (
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            A confirmation has been sent to{' '}
            <span className="text-foreground">{order.customerEmail}</span>. Order{' '}
            <span className="font-display text-foreground">
              #{order.id.slice(-8).toUpperCase()}
            </span>
            .
          </p>
        )}
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 pb-24 md:grid-cols-[1fr_18rem]">
        <div>
          <span className="eyebrow text-primary">Items</span>
          <ul className="mt-5 divide-y divide-border/60 border-y border-border/60">
            {items.map((item, idx) => {
              const product =
                typeof item.product === 'object' && item.product !== null
                  ? (item.product as Product)
                  : null
              const variant =
                typeof item.variant === 'object' && item.variant !== null
                  ? (item.variant as Variant)
                  : null
              const imageUrl = product ? getProductImage(product) : undefined

              return (
                <li key={item.id ?? idx} className="flex gap-4 py-5">
                  <div className="h-20 w-16 shrink-0 overflow-hidden bg-gradient-to-br from-blush via-rose/40 to-lavender/30">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={product?.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 items-start justify-between">
                    <div>
                      <div className="font-display text-lg">{product?.title ?? 'Product'}</div>
                      {variant?.title && (
                        <div className="text-xs text-muted-foreground">
                          {variant.title} · qty {item.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {order.amount && (
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-display text-lg">${(order.amount / 100).toFixed(2)}</dd>
              </div>
            </dl>
          )}
        </div>

        <aside className="space-y-6">
          {order.shippingAddress && (
            <div>
              <span className="eyebrow text-primary">Shipping to</span>
              <address className="mt-3 not-italic text-sm leading-relaxed">
                {[order.shippingAddress.firstName, order.shippingAddress.lastName]
                  .filter(Boolean)
                  .join(' ')}
                <br />
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && (
                  <>
                    <br />
                    {order.shippingAddress.addressLine2}
                  </>
                )}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </address>
            </div>
          )}
          <div>
            <span className="eyebrow text-primary">Status</span>
            <p className="mt-2 capitalize">{order.status ?? 'pending'}</p>
          </div>
          <Link
            href="/shop"
            className="block rounded-full border border-foreground px-6 py-3 text-center text-sm transition hover:bg-foreground hover:text-background"
          >
            Continue shopping
          </Link>
        </aside>
      </section>
    </div>
  )
}
