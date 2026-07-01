'use server'

import { createLocalReq, getPayload } from 'payload'
import configPromise from '@payload-config'
import { seed } from '@/endpoints/seed'

export async function seedDatabaseAction() {
  try {
    const payload = await getPayload({ config: configPromise })
    const req = await createLocalReq({}, payload)
    
    // Create a mock request object since seed expects a PayloadRequest
    await seed({ payload, req: req as any })
    
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to seed database' }
  }
}
