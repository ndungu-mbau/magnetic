import type { Category, Media, Product } from '@/payload-types'
import { cn } from '@/utilities/cn'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'Collections — Magnetic Cosmetics',
  description: 'Browse our fragrance collections.',
}

type SearchParams = Promise<{ cat?: string }>

function getProductImage(product: Product): string | undefined {
  const first = product.gallery?.[0]
  if (!first) return undefined
  const img = first.image
  if (typeof img === 'object' && img !== null) return (img as Media).url ?? undefined
  return undefined
}

export default async function CollectionsPage({ searchParams }: { searchParams: SearchParams }) {
  const { cat } = await searchParams

  const payload = await getPayload({ config: configPromise })

  const [categoriesResult, productsResult] = await Promise.all([
    payload.find({
      collection: 'categories',
      limit: 100,
      overrideAccess: false,
      select: { title: true, slug: true },
      sort: 'title',
    }),
    payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      limit: 100,
      where: {
        and: [
          { _status: { equals: 'published' } },
          ...(cat === 'uncategorized'
            ? [{ categories: { exists: false } }]
            : cat
              ? [{ 'categories.slug': { equals: cat } }]
              : []),
        ],
      },
      select: { title: true, slug: true, gallery: true, priceInKES: true },
      sort: 'title',
    }),
  ])

  const categories = categoriesResult.docs as Category[]
  const products = productsResult.docs as Product[]

  const activeCategory =
    cat === 'uncategorized'
      ? { title: 'Uncategorized', slug: 'uncategorized' as const }
      : (categories.find((c) => c.slug === cat) ?? null)

  const heading = activeCategory?.title ?? 'All Products'

  const sidebarLink = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={cn(
        'block rounded-sm px-3 py-2 text-sm transition-colors hover:bg-secondary',
        active ? 'bg-secondary font-medium text-foreground' : 'text-foreground/60',
      )}
    >
      {label}
    </Link>
  )

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex min-h-screen">
          {/* ── Left sidebar — sticky for the full viewport height ── */}
          <aside className="sticky top-16 self-start h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-border/60 py-8 pr-6">
            <p className="eyebrow mb-4 px-3 text-primary">Collections</p>
            <nav className="space-y-0.5">
              {sidebarLink('/collections', 'All Products', !cat)}
              {categories.map((category) =>
                sidebarLink(
                  `/collections?cat=${category.slug}`,
                  category.title,
                  cat === category.slug,
                ),
              )}
              {sidebarLink(
                '/collections?cat=uncategorized',
                'Uncategorized',
                cat === 'uncategorized',
              )}
            </nav>
          </aside>

          {/* ── Right content ── */}
          <div className="min-w-0 flex-1">
            {/* Sticky heading */}
            <div className="sticky top-16 z-10 border-b border-border/60 bg-background/90 py-5 pl-8 backdrop-blur-sm">
              <h1 className="font-display text-3xl">{heading}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            {/* Products grid */}
            <div className="py-10 pl-8">
              {products.length === 0 ? (
                <p className="py-24 text-center italic text-muted-foreground">
                  No products in this collection yet.
                </p>
              ) : (
                <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => {
                    const imageUrl = getProductImage(product)
                    return (
                      <Link key={product.id} href={`/shop/${product.slug}`} className="group block">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-gradient-to-br from-blush via-rose/40 to-lavender/30">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.title}
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <div className="h-3/5 w-1/3 rounded-sm bg-gradient-to-b from-white/80 to-lavender/40 shadow-xl transition group-hover:scale-105" />
                            </div>
                          )}
                        </div>
                        <div className="mt-5">
                          <h3 className="font-display text-2xl">{product.title}</h3>
                          {product.priceInKES != null && (
                            <p className="mt-1 text-sm italic text-muted-foreground">
                              KSH {product.priceInKES.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
