import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { CheckoutPage } from '@/components/checkout/CheckoutPage'

export default function Checkout() {
  return (
    <div className="bg-background">
      <header className="mx-auto max-w-6xl px-6 pb-10 pt-16 text-center">
        <span className="eyebrow text-primary">One last step</span>
        <h1 className="mt-4 font-display text-5xl">Checkout</h1>
      </header>
      <CheckoutPage />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Complete your order.',
  openGraph: mergeOpenGraph({ title: 'Checkout', url: '/checkout' }),
  title: 'Checkout',
}
