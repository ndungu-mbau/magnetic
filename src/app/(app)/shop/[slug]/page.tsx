import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Media, Product, Variant } from '@/payload-types'
import { Metadata } from 'next'
import { AddToCartButton } from '@/components/shop/AddToCartButton'
import { draftMode } from 'next/headers'

type Args = { params: Promise<{ slug: string }> }

function getProductImage(product: Product): string | undefined {
  const first = product.gallery?.[0]
  if (!first) return undefined
  const img = first.image
  if (typeof img === 'object' && img !== null) return (img as Media).url ?? undefined
  return undefined
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProduct(slug)
  if (!product) return { title: 'Not Found' }
  const imageUrl = getProductImage(product)
  return {
    title: product.title,
    description: product.meta?.description ?? '',
    openGraph: imageUrl
      ? { images: [{ url: imageUrl, alt: product.title }] }
      : undefined,
  }
}

export default async function ShopProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProduct(slug)
  if (!product) notFound()

  const imageUrl = getProductImage(product)

  const variants: Variant[] =
    (product.variants?.docs?.filter((v) => typeof v === 'object') as Variant[]) ?? []

  const relatedProducts: Product[] =
    (product.relatedProducts?.filter((r) => typeof r === 'object') as Product[]) ?? []

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-6">
        <Link href="/shop" className="eyebrow text-muted-foreground hover:text-foreground">
          ← Collection
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 md:grid-cols-2 md:items-start">
        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-full bg-gradient-to-br from-rose/50 via-lavender/30 to-transparent blur-3xl" />
          <div className="overflow-hidden rounded-sm bg-gradient-to-br from-blush via-rose/40 to-lavender/30 relative aspect-[4/5]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="h-3/5 w-1/3 rounded-sm bg-gradient-to-b from-white/80 to-lavender/40 shadow-xl" />
              </div>
            )}
          </div>
        </div>

        <div className="md:sticky md:top-24">
          <h1 className="mt-4 font-display text-5xl md:text-6xl">{product.title}</h1>

          {product.priceInUSD && (
            <div className="mt-8">
              <div className="eyebrow text-muted-foreground">Price</div>
              <div className="mt-1 font-display text-3xl">${product.priceInUSD.toFixed(2)}</div>
            </div>
          )}

          <AddToCartButton product={product} variants={variants} />

          <p className="mt-6 text-xs text-muted-foreground">
            Hand-blended in small batches · Ships in 3–5 days · Complimentary samples
          </p>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl md:text-4xl">You may also love</h2>
            <Link
              href="/shop"
              className="hidden text-sm underline-offset-4 hover:underline md:inline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.slice(0, 3).map((related) => {
              const relImg = getProductImage(related)
              return (
                <Link key={related.id} href={`/shop/${related.slug}`} className="group">
                  <div className="aspect-[4/5] overflow-hidden rounded-sm bg-gradient-to-br from-blush via-rose/40 to-lavender/30 relative">
                    {relImg ? (
                      <img
                        src={relImg}
                        alt={related.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="h-3/5 w-1/3 rounded-sm bg-gradient-to-b from-white/80 to-lavender/40 shadow-xl transition group-hover:scale-105" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="font-display text-xl">{related.title}</h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

async function queryProduct(slug: string): Promise<Product | null> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
    populate: {
      variants: { title: true, priceInUSD: true, inventory: true, options: true },
    },
  })
  return result.docs?.[0] ?? null
}
