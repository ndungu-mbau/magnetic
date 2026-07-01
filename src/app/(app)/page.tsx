import type { Media, Product } from '@/payload-types'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'Magnetic Cosmetics — Romantic Fragrance, Hand-Blended',
  description: 'Discover Magnetic Cosmetics: small-batch perfumes composed for the senses.',
}

function getProductImage(product: Product): string | undefined {
  const first = product.gallery?.[0]
  if (!first) return undefined
  const img = first.image
  if (typeof img === 'object' && img !== null) return (img as Media).url ?? undefined
  return undefined
}

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const { docs: featured } = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    limit: 3,
    where: { _status: { equals: 'published' } },
    select: { title: true, slug: true, gallery: true, priceInUSD: true },
  })

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 md:grid-cols-2 md:items-center md:pt-24">
          <div>
            <span className="eyebrow text-primary">Magnetic Cosmetics</span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              A fragrance is a <em className="italic text-primary">love letter</em> the skin
              remembers.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Composed in our atelier from rare florals and slow-aged resins. Each bottle is a
              small, romantic act.
            </p>
            <div className="mt-10 flex items-center gap-6">
              <Link
                href="/shop"
                className="rounded-full bg-foreground px-8 py-3 text-sm tracking-wide text-background transition hover:bg-primary"
              >
                Discover the collection
              </Link>
              <Link href="/about" className="text-sm underline-offset-4 hover:underline">
                About Us →
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-full bg-gradient-to-br from-rose/60 via-lavender/40 to-transparent blur-3xl" />
            <Image
              src="/hero.jpeg"
              alt="A lavender-tinted Magnetic Cosmetics fragrance bottle surrounded by dried roses"
              width={1600}
              height={1200}
              className="rounded-sm object-cover shadow-2xl"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow text-muted-foreground">The collection</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Currently in bloom</h2>
            </div>
            <Link
              href="/shop"
              className="hidden text-sm underline-offset-4 hover:underline md:inline"
            >
              View all →
            </Link>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {featured.map((product, i) => {
              const imageUrl = getProductImage(product as Product)
              return (
                <Link
                  href={`/shop/${product.slug}`}
                  key={product.id}
                  className="group cursor-pointer block"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-sm bg-gradient-to-br from-blush via-rose/60 to-lavender/40 relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        ${product.priceInUSD.toFixed(2)}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Story strip */}
      <section className="bg-secondary/50">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-24 text-center">
          <span className="eyebrow text-primary">The house</span>
          <h2 className="font-display text-4xl italic leading-tight md:text-5xl">
            &ldquo;We compose perfumes the way poets write —
            <br /> slowly, and only when something insists on being said.&rdquo;
          </h2>
          <Link
            href="/about"
            className="mx-auto inline-block text-sm underline-offset-4 hover:underline"
          >
            Read our story →
          </Link>
        </div>
      </section>
    </div>
  )
}
