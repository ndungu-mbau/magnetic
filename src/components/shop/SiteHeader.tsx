'use client'

import Link from 'next/link'
import { ShoppingBag, User } from 'lucide-react'
import { useEcommerce } from '@payloadcms/plugin-ecommerce/client/react'
import { useAuth } from '@/providers/Auth'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
] as const

export function SiteHeader() {
  const { cart } = useEcommerce()
  const { user } = useAuth()
  const pathname = usePathname()

  const count = ((cart as any)?.items ?? []).reduce(
    (sum: number, item: any) => sum + (item.quantity ?? 0),
    0,
  )

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex-1" />

        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="font-display text-2xl tracking-tight">Magnetic</span>
          <span className="eyebrow mt-0.5 text-muted-foreground">Cosmetics</span>
        </Link>

        <nav className="flex flex-1 items-center justify-end gap-6 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                'hidden text-foreground/70 transition hover:text-foreground md:inline ' +
                (pathname === n.href ? 'text-foreground' : '')
              }
            >
              {n.label}
            </Link>
          ))}
          <Link
            href={user ? '/account' : '/login'}
            aria-label="Account"
            className="text-foreground/70 transition hover:text-foreground"
          >
            <User className="h-4 w-4" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-foreground/70 transition hover:text-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
