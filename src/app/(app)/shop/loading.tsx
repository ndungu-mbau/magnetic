import React from 'react'

export default function Loading() {
  return (
    <div className="bg-background">
      <header className="mx-auto max-w-7xl px-6 pb-12 pt-20 text-center">
        <div className="mx-auto h-3 w-24 animate-pulse rounded bg-secondary" />
        <div className="mx-auto mt-6 h-14 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="mx-auto mt-5 h-4 w-1/2 animate-pulse rounded bg-secondary" />
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="border-y border-border/60 py-5">
          <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] animate-pulse rounded-sm bg-gradient-to-br from-blush via-rose/40 to-lavender/30" />
              <div className="mt-5 h-7 w-3/4 animate-pulse rounded bg-secondary" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
