'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useEcommerce } from '@payloadcms/plugin-ecommerce/client/react'
import type { Product, Variant } from '@/payload-types'

export function AddToCartButton({ product, variants }: { product: Product; variants: Variant[] }) {
  const { addItem, isLoading } = useEcommerce()
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants[0] ?? null)

  const price = selectedVariant?.priceInUSD ?? product.priceInUSD ?? 0

  const onAdd = async () => {
    try {
      await addItem(
        {
          product: product.id,
          ...(selectedVariant ? { variant: selectedVariant.id } : {}),
        },
        1,
      )
      toast.success(
        `${product.title}${selectedVariant ? ' · ' + selectedVariant.title : ''} added to cart`,
      )
    } catch {
      toast.error('Failed to add item to cart')
    }
  }

  return (
    <div className="mt-10">
      {variants.length > 1 && (
        <div className="mb-6">
          <div className="eyebrow text-muted-foreground">Variant</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={
                  'rounded-sm border px-5 py-3 text-sm transition ' +
                  (selectedVariant?.id === v.id
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-foreground/70 hover:border-foreground')
                }
              >
                {v.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end justify-between border-t border-border/60 pt-8">
        <button
          onClick={onAdd}
          disabled={isLoading}
          className="rounded-full bg-foreground px-10 py-4 text-sm tracking-wide text-background transition hover:bg-primary disabled:opacity-50"
        >
          {isLoading ? 'Adding…' : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}
