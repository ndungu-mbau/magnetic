'use client'

import type { User } from '@/payload-types'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  createAction,
  loginAction,
  logoutAction,
  meAction,
  forgotPasswordAction,
  resetPasswordAction,
} from './actions'

// eslint-disable-next-line no-unused-vars
type ResetPassword = (args: {
  password: string
  passwordConfirm: string
  token: string
}) => Promise<void>

type ForgotPassword = (args: { email: string }) => Promise<void> // eslint-disable-line no-unused-vars

type Create = (args: { email: string; password: string; passwordConfirm: string }) => Promise<void> // eslint-disable-line no-unused-vars

type Login = (args: { email: string; password: string }) => Promise<User> // eslint-disable-line no-unused-vars

type Logout = () => Promise<void>

type AuthContext = {
  create: Create
  forgotPassword: ForgotPassword
  login: Login
  logout: Logout
  resetPassword: ResetPassword
  setUser: (user: User | null) => void // eslint-disable-line no-unused-vars
  status: 'loggedIn' | 'loggedOut' | undefined
  user?: User | null
}

const Context = createContext({} as AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>()

  // used to track the single event of logging in or logging out
  // useful for `useEffect` hooks that should only run once
  const [status, setStatus] = useState<'loggedIn' | 'loggedOut' | undefined>()
  const create = useCallback<Create>(async (args) => {
    try {
      const res = await createAction(args)
      if (res.error) throw new Error(res.error)
      if (res.user) {
        setUser(res.user)
        setStatus('loggedIn')
      }
    } catch (e: any) {
      throw new Error(e.message || 'An error occurred while attempting to create an account.')
    }
  }, [])

  const login = useCallback<Login>(async (args) => {
    try {
      const res = await loginAction(args)
      if (res.error) throw new Error(res.error)
      if (res.user) {
        setUser(res.user)
        setStatus('loggedIn')
        return res.user
      }
      throw new Error('Invalid login')
    } catch (e: any) {
      throw new Error(e.message || 'An error occurred while attempting to login.')
    }
  }, [])

  const logout = useCallback<Logout>(async () => {
    try {
      const res = await logoutAction()
      if (res.error) throw new Error(res.error)
      setUser(null)
      setStatus('loggedOut')
    } catch (e: any) {
      throw new Error(e.message || 'An error occurred while attempting to logout.')
    }
  }, [])

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await meAction()
        if (res.error) throw new Error(res.error)
        setUser(res.user || null)
        setStatus(res.user ? 'loggedIn' : undefined)
      } catch (e) {
        setUser(null)
        throw new Error('An error occurred while fetching your account.')
      }
    }

    void fetchMe()
  }, [])

  const forgotPassword = useCallback<ForgotPassword>(async (args) => {
    try {
      const res = await forgotPasswordAction(args)
      if (res.error) throw new Error(res.error)
    } catch (e: any) {
      throw new Error(e.message || 'An error occurred while attempting to reset your password.')
    }
  }, [])

  const resetPassword = useCallback<ResetPassword>(async (args) => {
    try {
      const res = await resetPasswordAction(args)
      if (res.error) throw new Error(res.error)
      if (res.user) {
        setUser(res.user)
        setStatus('loggedIn')
      }
    } catch (e: any) {
      throw new Error(e.message || 'An error occurred while attempting to reset your password.')
    }
  }, [])

  return (
    <Context.Provider
      value={{
        create,
        forgotPassword,
        login,
        logout,
        resetPassword,
        setUser,
        status,
        user,
      }}
    >
      {children}
    </Context.Provider>
  )
}

type UseAuth<T = User> = () => AuthContext // eslint-disable-line no-unused-vars

export const useAuth: UseAuth = () => useContext(Context)
