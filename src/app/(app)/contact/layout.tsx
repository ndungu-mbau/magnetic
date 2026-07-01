import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Write to the Magnetic Cosmetics shop.',
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
