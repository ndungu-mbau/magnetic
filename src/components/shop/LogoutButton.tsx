'use client'

import { useAuth } from '@/providers/Auth'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      Sign out
    </button>
  )
}
