'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import type { Category } from '@/payload-types'
import { usePathname, useRouter } from 'next/navigation'

export function ShopFilters({
  categories,
  activeCategory,
}: {
  categories: Category[]
  activeCategory?: string
}) {
  return (
    <div className="space-y-8 border border-border/60 bg-secondary/30 p-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-primary">Refine</span>
        {activeCategory && (
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Clear
          </Link>
        )}
      </div>

      {categories.length > 0 && (
        <div>
          <div className="font-display text-lg">Category</div>
          <div className="mt-3 space-y-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex cursor-pointer items-center gap-3 text-sm text-foreground/80 hover:text-foreground"
              >
                <span
                  className={
                    'flex h-4 w-4 items-center justify-center border transition ' +
                    (activeCategory === cat.slug
                      ? 'border-foreground bg-foreground'
                      : 'border-border bg-background')
                  }
                >
                  {activeCategory === cat.slug && (
                    <span className="block h-1.5 w-1.5 bg-background" />
                  )}
                </span>
                <Link
                  href={activeCategory === cat.slug ? '/shop' : `/shop?category=${cat.slug}`}
                  className="flex-1"
                >
                  {cat.title}
                </Link>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
