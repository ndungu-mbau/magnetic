'use client'

import Link from 'next/link'
import { ShoppingBag, LayoutDashboard } from 'lucide-react'
import { useEcommerce } from '@payloadcms/plugin-ecommerce/client/react'
import { useAuth } from '@/providers/Auth'
import { usePathname } from 'next/navigation'
import { UserAvatar } from '@/components/UserAvatar'

const centerNav = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
] as const

export function SiteHeader() {
  const { cart } = useEcommerce()
  const { user } = useAuth()
  const pathname = usePathname()

  const count = ((cart as any)?.items ?? []).reduce(
    (sum: number, item: any) => sum + (item.quantity ?? 0),
    0,
  )

  const isAdmin = user?.roles?.includes('admin') ?? false

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">

        {/* Left — site name */}
        <div className="flex-1">
          <Link href="/" className="flex flex-col leading-none w-fit">
            <span className="font-display text-2xl tracking-tight">Magnetic</span>
            <span className="eyebrow mt-0.5 text-muted-foreground">Cosmetics</span>
          </Link>
        </div>

        {/* Center — page links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {centerNav.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className={
                'text-foreground/70 transition hover:text-foreground ' +
                (pathname === n.href ? 'text-foreground' : '')
              }
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right — cart, admin, account */}
        <div className="flex flex-1 items-center justify-end gap-5">
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

          {(!user || isAdmin) && (
            <Link
              href="/admin"
              aria-label="Admin dashboard"
              className="text-foreground/70 transition hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          )}

          {user ? (
            <UserAvatar name={user.name} email={user.email} />
          ) : (
            <Link
              href="/login"
              className="text-sm text-foreground/70 transition hover:text-foreground"
            >
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}
