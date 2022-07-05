import type { Handle } from '@sveltejs/kit'
import { createTRPCHandle } from 'trpc-sveltekit'

import { TRPC_URL } from '$lib/constants'
import { router } from '$lib/trpc-server'

export const handle: Handle = async ({ event, resolve }) => {
  const response = await createTRPCHandle({
    url: TRPC_URL,
    router,
    event,
    resolve,
  })

  return response
}
