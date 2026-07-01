'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export async function updateAccountAction(data: any) {
  try {
    const payload = await getPayload({ config: configPromise })
    const hdrs = await headers()
    
    // Verify the user is authenticated securely on the server
    const { user } = await payload.auth({ headers: hdrs })
    if (!user) {
      return { error: 'Not authenticated' }
    }
    
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data,
    })
    
    return { user: updatedUser }
  } catch (error: any) {
    return { error: error.message || 'Failed to update account' }
  }
}
