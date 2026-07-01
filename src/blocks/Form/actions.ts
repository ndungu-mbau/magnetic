'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function submitFormAction(formID: string, submissionData: any) {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.create({
      collection: 'form-submissions',
      data: {
        form: Number(formID),
        submissionData,
      },
    })

    return { success: true, result }
  } catch (error: any) {
    return { error: error.message || 'Internal Server Error' }
  }
}
