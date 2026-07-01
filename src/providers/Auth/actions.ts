'use server'

import type { User } from '@/payload-types'
import configPromise from '@payload-config'
import { cookies, headers } from 'next/headers'
import { getPayload } from 'payload'

export async function createAction(args: any) {
  try {
    const payload = await getPayload({ config: configPromise })

    await payload.create({
      collection: 'users',
      data: {
        email: args.email,
        password: args.password,
        name: args.name,
      },
    })

    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: args.email,
        password: args.password,
      },
    })

    if (loginResult.token) {
      const cookieStore = await cookies()
      cookieStore.set('payload-token', loginResult.token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    }

    return { user: loginResult.user as User }
  } catch (error: any) {
    return { error: error.message || 'Failed to create account' }
  }
}

export async function loginAction(args: any) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.login({
      collection: 'users',
      data: {
        email: args.email,
        password: args.password,
      },
    })

    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('payload-token', result.token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    }

    return { user: result.user as User }
  } catch (error: any) {
    return { error: error.message || 'Invalid login' }
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')
    return { success: true }
  } catch (error: any) {
    return { error: 'Failed to logout' }
  }
}

export async function meAction() {
  try {
    const payload = await getPayload({ config: configPromise })
    const hdrs = await headers()
    const { user } = await payload.auth({ headers: hdrs })
    return { user: user as User | null }
  } catch (error: any) {
    return { error: 'Failed to fetch user' }
  }
}

export async function forgotPasswordAction(args: any) {
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.forgotPassword({
      collection: 'users',
      data: {
        email: args.email,
      },
    })
    return { success: true }
  } catch (error: any) {
    return { error: 'Failed to reset password' }
  }
}

export async function resetPasswordAction(args: any) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.resetPassword({
      collection: 'users',
      data: {
        password: args.password,
        token: args.token,
      },
      overrideAccess: true,
    })

    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('payload-token', result.token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    }

    return { user: result.user as unknown as User }
  } catch (error: any) {
    return { error: 'Failed to reset password' }
  }
}
