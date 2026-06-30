import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Atelier — Magnetic Cosmetics',
  description: 'Inside the Magnetic Cosmetics atelier.',
}

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-32">
        <span className="eyebrow text-primary">The atelier</span>
        <h1 className="mt-6 font-display text-5xl italic leading-tight">
          Composed slowly, only when something insists on being said.
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
          Magnetic Cosmetics began as a small studio of two perfumers obsessed with the romance of a
          single drop. We blend by hand, in small batches, using rare florals and slow-aged resins.
          Our story page is being written — come back soon.
        </p>
      </div>
    </div>
  )
}
