import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create a Magnetic Cosmetics account.',
}

export default function CreateAccountLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
