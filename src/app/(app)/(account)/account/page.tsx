import { LogoutButton } from '@/components/shop/LogoutButton'
import type { Order } from '@/payload-types'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'Your account — Magnetic Cosmetics',
}

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login')
  }

  let orders: Order[] = []
  try {
    const result = await payload.find({
      collection: 'orders',
      limit: 10,
      user,
      overrideAccess: false,
      pagination: false,
      where: { customer: { equals: user.id } },
      sort: '-createdAt',
    })
    orders = result.docs
  } catch {}

  const displayName = user.name || user.email.split('@')[0]

  return (
    <div className="bg-background">
      <header className="mx-auto max-w-7xl px-6 pb-12 pt-20">
        <span className="eyebrow text-primary">Atelier</span>
        <div className="mt-4 flex items-end justify-between gap-6">
          <h1 className="font-display text-5xl italic md:text-6xl">Hello, {displayName}.</h1>
          <LogoutButton />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <span className="eyebrow text-primary">Orders</span>
        {orders.length === 0 ? (
          <div className="mt-6 border border-border/60 bg-secondary/30 p-10 text-center">
            <p className="italic text-muted-foreground">
              No orders yet — the first chapter is unwritten.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition hover:bg-primary"
            >
              Discover the collection
            </Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div>
                  <div className="font-display text-xl">Order #{order.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    · {(order.items ?? []).length} item
                    {(order.items ?? []).length === 1 ? '' : 's'} ·{' '}
                    <span className="capitalize">{order.status ?? 'pending'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {order.amount && (
                    <div className="font-display text-lg">${(order.amount / 100).toFixed(2)}</div>
                  )}
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
