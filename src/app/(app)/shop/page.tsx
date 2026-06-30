import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import type { Category, Media, Product } from '@/payload-types'
import { Metadata } from 'next'
import { ShopFilters } from '@/components/shop/ShopFilters'

export const metadata: Metadata = {
  title: 'Shop — Magnetic Cosmetics',
  description: 'Browse the Magnetic Cosmetics fragrance collection.',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function getProductImage(product: Product): string | undefined {
  const first = product.gallery?.[0]
  if (!first) return undefined
  const img = first.image
  if (typeof img === 'object' && img !== null) return (img as Media).url ?? undefined
  return undefined
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const { category: categoryFilter } = await searchParams

  const payload = await getPayload({ config: configPromise })

  const [productsResult, categoriesResult] = await Promise.all([
    payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      limit: 100,
      where: {
        and: [
          { _status: { equals: 'published' } },
          ...(categoryFilter ? [{ 'categories.slug': { equals: categoryFilter } }] : []),
        ],
      },
      select: { title: true, slug: true, gallery: true, priceInUSD: true, categories: true },
      sort: 'title',
    }),
    payload.find({
      collection: 'categories',
      limit: 50,
      overrideAccess: false,
      select: { title: true, slug: true },
      sort: 'title',
    }),
  ])

  const products = productsResult.docs
  const categories = categoriesResult.docs

  return (
    <div className="bg-background">
      <header className="mx-auto max-w-7xl px-6 pb-12 pt-20 text-center">
        <span className="eyebrow text-primary">The collection</span>
        <h1 className="mt-6 font-display text-5xl md:text-7xl">
          Every bottle, <em className="italic">a small confession</em>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Our compositions, blended by hand. Choose by mood, by note, or by the person you&apos;d
          like to become this evening.
        </p>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex items-center justify-between border-y border-border/60 py-5">
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? 'fragrance' : 'fragrances'}
            {categoryFilter && <> &middot; filtered</>}
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_18rem]">
          {/* Products grid */}
          <div>
            {products.length === 0 ? (
              <p className="py-24 text-center text-muted-foreground">
                Nothing in bloom under those filters just yet.
              </p>
            ) : (
              <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2">
                {products.map((product) => {
                  const imageUrl = getProductImage(product as Product)
                  return (
                    <Link key={product.id} href={`/shop/${product.slug}`} className="group block">
                      <div className="aspect-[4/5] overflow-hidden rounded-sm bg-gradient-to-br from-blush via-rose/40 to-lavender/30 relative">
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
                        {product.priceInUSD && (
                          <p className="mt-1 text-sm italic text-muted-foreground">
                            ${product.priceInUSD.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ShopFilters
                categories={categories as Category[]}
                activeCategory={categoryFilter as string | undefined}
              />
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
