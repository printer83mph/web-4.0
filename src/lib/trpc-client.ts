import * as trpc from '@trpc/client'

import { TRPC_URL } from './constants'

import type { Router } from '$lib/trpc-server'

const client = trpc.createTRPCClient<Router>({ url: TRPC_URL })

export default client

export async function uploadImage(image: File) {
  const reader = new FileReader()
  const base64Image = await new Promise<string>((resolve, reject) => {
    reader.readAsDataURL(image)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
  })
  const [, ...imageTrimmed] = base64Image.split(',')
  return client.mutation('upload-image', imageTrimmed.join(''))
}
