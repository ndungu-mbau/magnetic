'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/providers/Auth'

export default function CreateAccountPage() {
  const { create } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== passwordConfirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await create({ email, password, passwordConfirm })
      toast.success('Welcome to Magnetic Cosmetics')
      router.push('/account')
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background">
      <section className="mx-auto max-w-md px-6 pb-32 pt-20">
        <div className="text-center">
          <span className="eyebrow text-primary">Atelier</span>
          <h1 className="mt-4 font-display text-5xl italic">Compose your story.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Create an account to keep your favorites and orders in one place.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <Field
            label="Name"
            required
            disabled={loading}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Field
            label="Email"
            type="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Field
            label="Password"
            type="password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Field
            label="Confirm password"
            type="password"
            required
            disabled={loading}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-foreground px-6 py-3 text-sm text-background transition hover:bg-primary disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  )
}

function Field({
  label,
  error,
  ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground disabled:opacity-50"
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  )
}
